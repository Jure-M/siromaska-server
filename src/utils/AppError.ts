class AppError extends Error {
  public status: 'error' | 'fail';
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
  }
}

export default AppError;
