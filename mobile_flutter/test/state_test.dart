import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/api/assignments_api.dart';
import 'package:mobile_flutter/src/api/api_client.dart';
import 'package:mobile_flutter/src/api/auth_api.dart';
import 'package:mobile_flutter/src/app/router.dart';
import 'package:mobile_flutter/src/models/assignment.dart';
import 'package:mobile_flutter/src/models/order.dart';
import 'package:mobile_flutter/src/models/user.dart';
import 'package:mobile_flutter/src/services/push_notifications.dart';
import 'package:mobile_flutter/src/state/assignments_state.dart';
import 'package:mobile_flutter/src/state/auth_state.dart';
import 'package:mobile_flutter/src/storage/secure_storage.dart';

User _user({String id = 'u1'}) => User(
      id: id,
      name: 'Test Rider',
      phoneNumber: '0780000000',
      status: UserStatus.active,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-06T00:00:00Z',
    );

Assignment _assignment({
  String id = 'a1',
  String orderId = 'o1',
  AssignmentStatus status = AssignmentStatus.pending,
  String updatedAt = '2026-10-06T00:00:00Z',
  Order? order,
}) =>
    Assignment(
      id: id,
      orderId: orderId,
      status: status,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: updatedAt,
      order: order,
    );

Order _order({String id = 'o1', OrderStatus? status}) => Order(
      id: id,
      referenceId: 'REF-$id',
      createdById: 'u9',
      status: status,
      type: OrderType.send,
      discount: 0,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-06T00:00:00Z',
    );

DioException _dio401() => DioException(
      requestOptions: RequestOptions(path: '/x'),
      response: Response(
        requestOptions: RequestOptions(path: '/x'),
        statusCode: 401,
        data: {'message': 'unauthorized'},
      ),
      type: DioExceptionType.badResponse,
    );

DioException _dioOffline() => DioException(
      requestOptions: RequestOptions(path: '/x'),
      type: DioExceptionType.connectionError,
    );

class FakeSecureStorage extends SecureStorage {
  final kv = <String, String>{};
  User? user;

  @override
  Future<void> saveToken(String token) async => kv['token'] = token;

  @override
  Future<String?> getToken() async => kv['token'];

  @override
  Future<void> removeToken() async => kv.remove('token');

  @override
  Future<void> saveUserData(User u) async => user = u;

  @override
  Future<User?> getUserData() async => user;

  @override
  Future<void> removeUserData() async => user = null;

  @override
  Future<void> clearAllData() async {
    kv.clear();
    user = null;
  }

  @override
  Future<void> saveLanguage(String language) async => kv['lang'] = language;

  @override
  Future<String?> getLanguage() async => kv['lang'];
}

class FakePushService extends PushService {
  final calls = <String>[];

  @override
  void initialize() {}

  @override
  Future<bool> requestPermission() async => true;

  @override
  Future<void> login(String userId) async => calls.add('login:$userId');

  @override
  Future<void> logout() async => calls.add('logout');
}

class FakeAuthApi extends AuthApi {
  FakeAuthApi()
      : super(ApiClient(storage: FakeSecureStorage(), dio: Dio()));

  Future<AuthResponse> Function(LoginCredentials)? loginImpl;
  Future<User> Function()? profileImpl;
  var logoutCalls = 0;

  @override
  Future<AuthResponse> login(LoginCredentials c) =>
      loginImpl != null ? loginImpl!(c) : throw UnimplementedError('login');

  @override
  Future<User> getProfile() =>
      profileImpl != null ? profileImpl!() : throw UnimplementedError();

  @override
  Future<void> logout() async => logoutCalls++;
}

class FakeAssignmentsApi extends AssignmentsApi {
  FakeAssignmentsApi()
      : super(ApiClient(storage: FakeSecureStorage(), dio: Dio()));

  Future<Paginated<Assignment>> Function({int page, int? size})? getAllImpl;
  Future<Assignment> Function(String id)? acceptImpl;
  Future<Assignment> Function(String id, String? reason)? rejectImpl;
  String? lastRejectReason;

  @override
  Future<Paginated<Assignment>> getAll({int page = 1, int? size}) =>
      getAllImpl != null
          ? getAllImpl!(page: page, size: size)
          : throw UnimplementedError('getAll');

  @override
  Future<Assignment> accept(String id) => acceptImpl != null
      ? acceptImpl!(id)
      : throw UnimplementedError('accept');

  @override
  Future<Assignment> reject(String id, {String? reason}) {
    lastRejectReason = reason;
    return rejectImpl != null
        ? rejectImpl!(id, reason)
        : throw UnimplementedError('reject');
  }
}

ProviderContainer _container({
  FakeSecureStorage? storage,
  FakePushService? push,
  FakeAuthApi? authApi,
  FakeAssignmentsApi? assignmentsApi,
}) {
  return ProviderContainer(
    overrides: [
      secureStorageProvider.overrideWithValue(storage ?? FakeSecureStorage()),
      pushServiceProvider.overrideWithValue(push ?? FakePushService()),
      if (authApi != null) authApiProvider.overrideWithValue(authApi),
      if (assignmentsApi != null)
        assignmentsApiProvider.overrideWithValue(assignmentsApi),
    ],
  );
}

void main() {
  group('redirectFor', () {
    const anon = AuthState(isBootstrapped: true);
    const authed = AuthState(isBootstrapped: true, isAuthenticated: true);

    test('unbootstrapped auth never redirects', () {
      expect(
        redirectFor(auth: const AuthState(), location: '/dashboard'),
        isNull,
      );
    });

    test('anonymous rider is sent to login', () {
      expect(redirectFor(auth: anon, location: '/dashboard'), '/login');
      expect(redirectFor(auth: anon, location: '/assignment/a1'), '/login');
    });

    test('anonymous rider stays on auth pages', () {
      expect(redirectFor(auth: anon, location: '/login'), isNull);
      expect(redirectFor(auth: anon, location: '/support'), isNull);
    });

    test('authenticated rider leaves login for the dashboard', () {
      expect(redirectFor(auth: authed, location: '/login'), '/dashboard');
      expect(redirectFor(auth: authed, location: '/dashboard'), isNull);
      expect(
        redirectFor(auth: authed, location: '/assignment/a1'),
        isNull,
      );
    });
  });

  group('AuthNotifier', () {
    test('login stores the session and registers push', () async {
      final storage = FakeSecureStorage();
      final push = FakePushService();
      final api = FakeAuthApi()
        ..loginImpl = (_) async =>
            AuthResponse(user: _user(), token: 'tok-1');
      final c = _container(storage: storage, push: push, authApi: api);
      addTearDown(c.dispose);

      final ok = await c.read(authProvider.notifier).login(
            const LoginCredentials(username: 'rider', password: 'pw'),
          );

      expect(ok, isTrue);
      final state = c.read(authProvider);
      expect(state.isAuthenticated, isTrue);
      expect(state.user?.id, 'u1');
      expect(await storage.getToken(), 'tok-1');
      expect(push.calls, contains('login:u1'));
    });

    test('failed login surfaces an error and stays logged out', () async {
      final api = FakeAuthApi()..loginImpl = (_) async => throw _dio401();
      final c = _container(authApi: api);
      addTearDown(c.dispose);

      final ok = await c.read(authProvider.notifier).login(
            const LoginCredentials(username: 'rider', password: 'bad'),
          );

      expect(ok, isFalse);
      final state = c.read(authProvider);
      expect(state.isAuthenticated, isFalse);
      expect(state.error, isNotEmpty);
    });

    test('401 on restore clears the session', () async {
      final storage = FakeSecureStorage()
        ..kv['token'] = 'stale'
        ..user = _user();
      final api = FakeAuthApi()..profileImpl = () async => throw _dio401();
      final c = _container(storage: storage, authApi: api);
      addTearDown(c.dispose);

      final ok = await c.read(authProvider.notifier).checkAuth();

      expect(ok, isFalse);
      expect(c.read(authProvider).isAuthenticated, isFalse);
      expect(await storage.getToken(), isNull);
      expect(await storage.getUserData(), isNull);
    });

    test('offline restore keeps the cached session', () async {
      final cached = _user();
      final storage = FakeSecureStorage()
        ..kv['token'] = 'tok-1'
        ..user = cached;
      final api = FakeAuthApi()
        ..profileImpl = () async => throw _dioOffline();
      final c = _container(storage: storage, authApi: api);
      addTearDown(c.dispose);

      final ok = await c.read(authProvider.notifier).checkAuth();

      expect(ok, isTrue);
      final state = c.read(authProvider);
      expect(state.isAuthenticated, isTrue);
      expect(state.user?.id, 'u1');
      expect(await storage.getToken(), 'tok-1');
    });

    test('401 handler clears the session and logs push out', () async {
      final storage = FakeSecureStorage()
        ..kv['token'] = 'tok-1'
        ..user = _user();
      final push = FakePushService();
      final api = FakeAuthApi()
        ..profileImpl = () async => _user();
      final c = _container(storage: storage, push: push, authApi: api);
      addTearDown(c.dispose);
      await c.read(authProvider.notifier).checkAuth();
      expect(c.read(authProvider).isAuthenticated, isTrue);

      await c.read(authProvider.notifier).handleUnauthorized();

      expect(c.read(authProvider).isAuthenticated, isFalse);
      expect(await storage.getToken(), isNull);
      expect(push.calls, contains('logout'));
    });
  });

  group('AssignmentsNotifier', () {
    test('fetch keeps the newest row per order', () async {
      final api = FakeAssignmentsApi()
        ..getAllImpl = ({page = 1, size}) async => Paginated(
              data: [
                _assignment(
                  id: 'old',
                  orderId: 'o1',
                  updatedAt: '2026-10-01T00:00:00Z',
                ),
                _assignment(
                  id: 'new',
                  orderId: 'o1',
                  updatedAt: '2026-10-06T00:00:00Z',
                ),
                _assignment(id: 'solo', orderId: 'o2'),
              ],
              total: 3,
              page: 1,
              size: 20,
              totalPages: 1,
            );
      final c = _container(assignmentsApi: api);
      addTearDown(c.dispose);

      await c.read(assignmentsProvider.notifier).fetchAssignments();

      final ids =
          c.read(assignmentsProvider).assignments.map((a) => a.id).toList();
      expect(ids, containsAll(['new', 'solo']));
      expect(ids, isNot(contains('old')));
    });

    test('visible sorts in-transit orders first', () async {
      final api = FakeAssignmentsApi()
        ..getAllImpl = ({page = 1, size}) async => Paginated(
              data: [
                _assignment(
                  id: 'paid',
                  orderId: 'o1',
                  order: _order(id: 'o1', status: OrderStatus.paid),
                ),
                _assignment(
                  id: 'moving',
                  orderId: 'o2',
                  order: _order(id: 'o2', status: OrderStatus.inTransit),
                ),
              ],
              total: 2,
              page: 1,
              size: 20,
              totalPages: 1,
            );
      final c = _container(assignmentsApi: api);
      addTearDown(c.dispose);

      await c.read(assignmentsProvider.notifier).fetchAssignments();
      c.read(assignmentsProvider.notifier).setFilter(AssignmentFilter.all);

      expect(
        c.read(assignmentsProvider).visible.map((a) => a.id).toList(),
        ['moving', 'paid'],
      );
    });

    test('accept flips the row to active', () async {
      final api = FakeAssignmentsApi();
      api.getAllImpl = ({page = 1, size}) async => Paginated(
            data: [_assignment(id: 'a1')],
            total: 1,
            page: 1,
            size: 20,
            totalPages: 1,
          );
      api.acceptImpl = (id) async =>
          _assignment(id: id, status: AssignmentStatus.active);
      final c = _container(assignmentsApi: api);
      addTearDown(c.dispose);
      await c.read(assignmentsProvider.notifier).fetchAssignments();

      final ok = await c.read(assignmentsProvider.notifier).accept('a1');

      expect(ok, isTrue);
      expect(
        c.read(assignmentsProvider).assignments.single.status,
        AssignmentStatus.active,
      );
    });

    test('reject flips the row and forwards the reason', () async {
      final api = FakeAssignmentsApi();
      api.getAllImpl = ({page = 1, size}) async => Paginated(
            data: [_assignment(id: 'a1')],
            total: 1,
            page: 1,
            size: 20,
            totalPages: 1,
          );
      api.rejectImpl = (id, reason) async =>
          _assignment(id: id, status: AssignmentStatus.rejected);
      final c = _container(assignmentsApi: api);
      addTearDown(c.dispose);
      await c.read(assignmentsProvider.notifier).fetchAssignments();

      final ok = await c
          .read(assignmentsProvider.notifier)
          .reject('a1', reason: 'Too far');

      expect(ok, isTrue);
      expect(api.lastRejectReason, 'Too far');
      expect(
        c.read(assignmentsProvider).assignments.single.status,
        AssignmentStatus.rejected,
      );
    });
  });
}
