class ModalService {
  constructor($uibModal) {
    'ngInject';
    this.$uibModal = $uibModal;
  }
  openModal(
      controller = 'ModalController',
      templateUrl = 'app/components/modals/default-modal.html',
      dataObj = null,
      size = 'sm') {
    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: templateUrl,
      controller: controller,
      controllerAs: 'modal',
      size: size,
      resolve: {
        dataObj: () => dataObj
      }
    });

    // modalInstance.result.then(function() {
    // }, function() {
    //   //console.info('Modal dismissed at: ' + new Date());
    // });
    return modalInstance.result;
  }


}

export default ModalService;
