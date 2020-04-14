
define([
        'require',
        './external/aws-sdk',
        './external/browser-bunyan',
        './external/@browser-bunyan/server-stream',
        './external/@browser-bunyan/console-raw-stream',
        './external/kinesiswritable',
        'nbextensions/username'
], function (require,
             AWS,
             BrowserBunyan,
             serverStream,
             consoleRawStream,
             KinesisWritable,
             getUsernameForConfig
) {
  function logger() {
    function setupKinesisWritableLogger() {
      const BrowserBunyan = window.BrowserBunyan;
      const KinesisWritable = window.KinesisWritable;
      const ConsoleRawStream = window.consoleRawStream.ConsoleRawStream;
      var kinesisWritableStream = new KinesisWritable({
        streamName: "mentoracademy",
        objectMode: true
      });
      var consoleStream = new ConsoleRawStream();
      let bunyan_setup = {
        name: 'Doug_',
        username: getUsernameForConfig.getUsernameForConfig(),
        window_location: window.location.href,
        streams: [
          {
            level: 'info',
            stream: kinesisWritableStream
          },
          {
            level: "debug",
            stream: consoleStream,
            throttleInterval: 5000
          }
        ]
      };
      var logger = BrowserBunyan.createLogger(bunyan_setup);
      return logger;
    }
    var logger = setupKinesisWritableLogger();
    return logger;
  }
  return {log: logger()};
});
