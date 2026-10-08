// Validators ported from mobile/utils/validators.ts.

bool isValidPhoneNumber(String phone) {
  final cleaned = phone.replaceAll(RegExp(r'\D'), '');
  return cleaned.length >= 10 && cleaned.length <= 12;
}

bool isValidEmail(String email) {
  return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email);
}

bool isValidPassword(String password) => password.length >= 6;

String? getPasswordError(String password) {
  if (password.isEmpty) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

String? getPhoneError(String phone) {
  if (phone.isEmpty) return 'Phone number is required';
  if (!isValidPhoneNumber(phone)) return 'Please enter a valid phone number';
  return null;
}

bool isRequired(String value) => value.trim().isNotEmpty;

bool isValidUsername(String username) {
  return RegExp(r'^[a-zA-Z0-9_-]{3,30}$').hasMatch(username);
}

bool isValidUsernameOrEmail(String value) =>
    isValidEmail(value) || isValidUsername(value);

String? getUsernameError(String username) {
  if (username.isEmpty) return 'Username or email is required';
  if (!isValidUsernameOrEmail(username)) {
    return 'Please enter a valid email address or username';
  }
  return null;
}

String? getRequiredError(String value, String fieldName) {
  if (!isRequired(value)) return '$fieldName is required';
  return null;
}
