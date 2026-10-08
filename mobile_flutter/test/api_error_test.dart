import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/api/api_client.dart';
import 'package:mobile_flutter/src/i18n/localizations.dart';
import 'package:mobile_flutter/src/utils/app_error.dart';

String _en(String key, [Map<String, Object>? values]) =>
    translate(AppLanguage.en, key, values);
String _rw(String key, [Map<String, Object>? values]) =>
    translate(AppLanguage.rw, key, values);

DioException _withStatus(int status, [Object? data]) {
  return DioException(
    requestOptions: RequestOptions(path: '/x'),
    response: Response(
      requestOptions: RequestOptions(path: '/x'),
      statusCode: status,
      data: data,
    ),
    type: DioExceptionType.badResponse,
  );
}

void main() {
  test('401 maps to auth with a session message', () {
    final err = handleApiError(_withStatus(401, {'message': 'x'}));
    expect(err.type, ErrorType.auth);
    expect(getErrorMessage(err, _en), contains('session has expired'));
  });

  test('400/422 map to validation with the server message', () {
    final err = handleApiError(_withStatus(422, {'message': 'Bad field'}));
    expect(err.type, ErrorType.validation);
    expect(getErrorMessage(err, _en), 'Bad field');
  });

  test('5xx maps to a generic server message', () {
    final err = handleApiError(_withStatus(503));
    expect(err.type, ErrorType.server);
    expect(getErrorMessage(err, _en), contains('try again later'));
  });

  test('transport failure maps to network', () {
    final err = handleApiError(
      DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.connectionError,
      ),
    );
    expect(err.type, ErrorType.network);
    expect(getErrorMessage(err, _en), contains('internet connection'));
  });

  test('classifiable errors resolve through the rw table', () {
    final network = handleApiError(
      DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.connectionError,
      ),
    );
    expect(getErrorMessage(network, _rw), contains('interineti'));
    final auth = handleApiError(_withStatus(401, {'message': 'x'}));
    expect(getErrorMessage(auth, _rw), contains('Ongera winjire'));
  });

  test('envelopeData unwraps {message, data}', () {
    final response = Response(
      requestOptions: RequestOptions(path: '/x'),
      data: {
        'message': 'ok',
        'data': {'id': '1'},
      },
    );
    expect(envelopeData<Map<String, dynamic>>(response), {'id': '1'});
  });
}
