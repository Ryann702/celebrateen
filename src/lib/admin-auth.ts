export function isAdminRequest(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password");

  return Boolean(password && provided && provided === password);
}
