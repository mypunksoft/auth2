navigator.bluetooth.requestDevice({
  filters: [
    { name: 'Смартфон' }, // замените на имя вашего смартфона
    { name: 'Android' }
  ],
  acceptAllDevices: true,
  optionalServices: ['generic_access', 'generic_attribute']
}).then(device => {
  console.log('Устройство подключено:', device);
  return device;
}).then(device => {
  return device.gatt.connect();
}).then(connection => {
  console.log('Соединение установлено:', connection);
  return connection;
}).then(connection => {
  return connection.getPrimaryServices();
}).then(services => {
  console.log('Сервисы:', services);
  return services[0]; // замените на номер сервиса
}).then(service => {
  return service.getCharacteristics();
}).then(characteristics => {
  console.log('Характеристики:', characteristics);
  return characteristics[0]; // замените на номер характеристики
}).then(characteristic => {
  return characteristic.writeValue(new Uint8Array([0x01, 0x02, 0x03]));
}).then(() => {
  console.log('Запрос отправлен');
}).catch(error => {
  console.error('Ошибка:', error);
});
