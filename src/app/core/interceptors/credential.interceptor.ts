import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const reqConCredenciales = req.clone({
    withCredentials: true,
  });
  return next(reqConCredenciales);
};
