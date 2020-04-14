# external/

## Node modules used by Notebook extensions.

Node modules used in Notebook extensions go here. Node modules cannot simply be
used as-is in notebook extensions. They must first be "browserified" using the
browserify command. Only then can we import node modules in notebook extensions.
Further instructions on browserfying These node modules are the result of
'Browserifying,' so they can be used in notebook extensions can be found
[here](../../docs/npmModules.md).

### aws-sdk.js

Allows us to connect to Amazon Web Services. This module is used by
bunyanlogger.js to connect to Kinesis Firehose (data streaming).

### bunyan.js

Bunyan is a logger. We use it as the logger in bunyanlogger.js. Bunyan logs are
PUT to the Kinesis Firehose.
