export class LoginService {
  doLogin(axios: any, username: any, password: any) {
    return axios.loginService.post('/login', { username, password })
  }
}