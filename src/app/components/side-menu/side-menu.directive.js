class SideMenuDirective {
  constructor() {
    'ngInject';
    let directive = {
      restrict: 'E',
      templateUrl: 'app/components/side-menu/side-menu.html',
      scope: false,
      controller: SideMenuController,
      controllerAs: 'sideMenu',
      bindToController: true
    };
    return directive;
  }
}

class SideMenuController {
  constructor($scope, $rootScope, socketService, mockService,
      $state, modalService, playerService, themeManager, $log, $http, $window) {
    'ngInject';
    this.$state = $state;
    this.$window = $window;
    this.socketService = socketService;
    this.modalService = modalService;
    this.playerService = playerService;
    this.visible = false;
    this.theme = themeManager.theme;
    this.$log = $log;
    this.$scope = $scope;
    // this.menuItems = mockService.get('getMenuItems');

    this.init();
    $rootScope.$on('socket:init', () => {
      this.init();
    });
    $rootScope.$on('socket:reconnect', () => {
      this.initService();
    });
  }

  toggleAnalogInput() {
    this.socketService.emit('callMethod', {
      endpoint: 'system_controller/gpios',
      method: 'DASwitchPress'
    });
  }

  toggleMenu() {
    this.visible = !this.visible;
  }

  itemClick(item) {
    this.toggleMenu();
    this.$log.debug(item);
    if (item.id === 'modal') {
      let
        controllerName = item.params.modalName.split('-').map(
          (item) => {
            return item[0].toUpperCase() + item.slice(1, item.length);
          }).join(''),
        templateUrl = 'app/components/side-menu/elements/' +
            item.params.modalName + '.html'  ;
      this.$log.debug(controllerName);
      this.modalService.openModal(
        controllerName + 'Controller',
        templateUrl,
        item,
        item.params.modalSize || 'lg');
    } else if (item.id === 'link') {
      this.$window.open(item.params.url);
    } else if (item.id === 'static-page') {
      this.$state.go('volumio.static-page', {pageName: item.pageName});
    } else if (item.state) {
      this.$log.debug(item.state, item.params);
      if (item.params) {
        for (let param in item.params) {
          item.params[param] = String(item.params[param]).replace('/', '-');
        }
        this.$state.go(item.state, item.params);
      } else {
        this.$state.go(item.state);
      }
    } else {
      this.$state.go(item.state);
    }
  }

  init() {
    this.registerListner();
    this.initService();
    this.watcherHandler = this.$scope.$watch(
      () => 
        this.playerService &&
        this.playerService.state && 
        this.playerService.state.service, (val) => {
      if (val) {
        this.analogIn = this.playerService.state.service === 'analogin';
      }
    });
  }

  registerListner() {
    this.socketService.on('pushMenuItems', (data) => {
      this.$log.debug('pushMenuItems', data);
      this.menuItems = data;
    });

    this.$scope.$on('$destroy', () => {
      this.socketService.off('pushMenuItems');
    });
  }

  initService() {
    this.socketService.emit('getMenuItems');
  }
}

export default SideMenuDirective;
