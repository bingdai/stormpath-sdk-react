import BaseStore from './BaseStore';
import UserActions from '../actions/UserActions';

export default class UserStore extends BaseStore {
  constructor(userService, sessionStore) {
    super();
    this.service = userService;
    this.sessionError = null;
    this.sessionStore = sessionStore;
    this.resolveSession();
  }

  isAuthenticated(callback) {
    this.resolveSession((err, result) => {
      callback(err, !err && !this.sessionStore.empty());
    });
  }

  getLoginViewData(callback) {
    this.service.getLoginViewData(callback);
  }

  login(options, callback) {
    this.reset();

    this.service.login(options, (err, result) => {
      if (err) {
        return callback(err);
      }

      this.sessionError = null;
      this.sessionStore.set(result);
      UserActions.set(result);
      this.emitChange();

      callback(null, result);
    });
  }

  register(options, callback) {
    this.service.register(options, callback);
  }

  getRegisterViewData(callback) {
    this.service.getRegisterViewData(callback);
  }

  forgotPassword(options, callback) {
    this.service.forgotPassword(options, callback);
  }

  changePassword(options, callback) {
    this.service.changePassword(options, callback);
  }

  updateProfile(data, callback) {
    this.service.updateProfile(data, callback);
  }

  verifyEmail(spToken, callback) {
    this.service.verifyEmail(spToken, callback);
  }

  logout(callback) {
    this.service.logout((err) => {
      if (err) {
        return callback(err);
      }

      this.reset();
      this.emitChange();

      callback();
    });
  }

  resolveSession(callback) {
    if (this.sessionError || !this.sessionStore.empty()) {
      return callback && callback(this.sessionError, this.sessionStore.get());
    }

    this.service.me((err, result) => {
      if (err) {
        this.sessionError = err;
        this.sessionStore.reset();
        UserActions.set(null);
      } else {
        this.sessionError = null;
        this.sessionStore.set(result);
        UserActions.set(result);
      }

      if (callback) {
        callback(this.sessionError, this.session);
      }

      this.emitChange();
    });
  }

  reset() {
    this.sessionError = null;
    this.sessionStore.reset();
    UserActions.set(null);
  }
}
