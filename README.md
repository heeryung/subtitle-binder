# extensions_student/


## Jupyter Notebook JavaScript extensions for when a user logs in as a student.
These extensions facilitate trying out questions written by Mentors.


### external/

Node modules used in Notebook extensions go here. Node modules cannot simply be
used as-is in notebook extensions. They must first be "browserified" using the
browserify command. Only then can we import node modules in notebook extensions.
Further instructions on browserfying These node modules are the result of
'Browserifying,' so they can be used in notebook extensions can be found
[here](../docs/npmModules.md).

### activepartevent.js

Custom event: When student types their solution in a part, broadcast event with
timestamp and part_id

### bunyanlogging.js

Logs user activity as Bunyan logs and sends to AWS Kinesis. Any custom events
are for the purpose of these logs.

### cell.js

This code is the prototype for the cell object in the original Jupyter notebook
code. We have it here in the form of an extension to allow us to manipulate
cells.

### codecell.js

This code is the prototype for the codecell object in the original Jupyter
notebook code. We have it here in the form of an extension to allow us to
manipulate codecells.

### debug.js

Button in question notebooks that reveals "hints" - descriptions of each cell
type.

### getattempts.js

FIXME: Add description

### getquestions.js

Button that presents a menu for selecting a question notebook to open.

### getsolutions.js

Exports the funciton ```insertSolutionCells()```. Calling this function will insert color coded solution cells.

### insertcell.js

This code is the prototype for inserting cells in the original Jupyter notebook
code. We have it here in the form of an extension to allow us to insert cells.

### jupyterevents.js

Defines class hierarchy of custom JupyterEvents. By instantiating these events, you automatically bind them. ```setupjupytereventlogging.js``` attaches these classes to the jupyterlogger so that they are automatically logged.

### jupyterlogger.js

Exposes custom logger to all extensions. To import, add ```'nbextensions/jupyterlogger'``` to your ```define([])``` parameters. Say we import this module as  ```jupyterLogger```, then we can log for debugging purposes like this: ```jupyterLogger.log.debug("brah brwah");```.

### openquestionevent.js

Fires a single event upon opening a question notebook. Event is just to
broadcast that student opened a question.

### rating.js

Creates dialog for students to rate question.

### reloadsolutions.js

When a notebook is opened, this checks if solutions should be reloaded. Solutions should be reloaded if the student has already submitted his answer for this question.

### setcolorsandeditable.js

Sets the editable tag in each cell's metadata. E.g., datasets should not be
editable. Greys out uneditable cells.

### setupjupytereventlogging.js

Sets up listeners for our custom JupyterEvents (defined in ```jupyterevents.js```). These events are logged by the jupyterlogger in ```jupyterlogger.js```.

### submitcontainer.js

FIXME: Add description

### submitsolution.js

Saves the student's typed solutions to database.

### textcell.js

This code is the prototype for the textcell object in the original Jupyter
notebook code. We have it here in the form of an extension to allow us to
manipulate textcell.

### togglesolutionevent.js

When student toggles (shows/hides) a solution for a part, broadcast event.

### url.js

Provides a function for getting the correct API call based on the environment
(dev, prod, local). This function is used by many other extensions.

### username.js

Provides a function for getting the correct username on the environment (dev,
prod, local). This function is used by many other extensions.

### getattempts.js

Get previous attempts for that question.

### submitcontainer.js

Save your docker container and publish it as a .tar.gz file.
