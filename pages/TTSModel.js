import * as React from 'react';

import {
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  FAB,
  Icon,
  List,
  PaperProvider,
  Portal,
  ProgressBar,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import Message from '../components/Message';
import * as Api from '../shared/remote'; // Assuming you have a remote module adapted for React Native
import { mdTheme } from '../shared/styles';

function NotConfigured() {
  return <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <Text variant="headlineMedium" style={{ marginTop: 20, textAlign: 'center' }}>
      GPT-SoViTs Middleware Not Configured
    </Text>
    <Text variant="bodyLarge" style={{ marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
      {"You may go to More -> Settings -> GPT-SoViTs Middleware API URL to add a GPT-SoViTs middleware API URL."}
    </Text>
    <Text variant="bodyMedium" style={{ marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </Text>
  </View>
}


function AddNewCharacterDialog({ open, onOk, onErr, onClose }) {
  const [names, setNames] = React.useState([]);
  const [editingName, setEditingName] = React.useState('');
  const [sourcesToFetch, setSourcesToFetch] = React.useState([]);
  const [editingSource, setEditingSource] = React.useState(null);
  const inputRef1 = React.useRef(null);
  const inputRef2 = React.useRef(null);

  const addName = () => {
    if (editingName) {
      setNames([...names, editingName]);
      setEditingName("");
    } else {
      onErr('Please enter a name for the character');
    }
  };

  const removeName = (index) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const addSource = () => {
    if (editingSource) {
      setSourcesToFetch([...sourcesToFetch, editingSource]);
      setEditingSource("");
    } else {
      onErr('Please enter a source URL to fetch');
    }
  };

  const removeSource = (index) => {
    setSourcesToFetch(sourcesToFetch.filter((_, i) => i !== index));
  };


  return <Dialog onDismiss={onClose} visible={open}>

    <Dialog.Title>Add New Character</Dialog.Title>
    <Dialog.Content style={{ minWidth: '80vw' }}>
      <TouchableWithoutFeedback onPress={() => {
        console.log('blur input')
        inputRef1.current?.blur()
        inputRef2.current?.blur()
      }}>
        <>
          <View style={{ marginTop: 10 }} />
          <TextInput
            label="Character Name"
            value={editingName}
            onChangeText={(text) => setEditingName(text)}
            ref={inputRef1}
          />
          <Button
            onPress={addName}
            mode="contained"
            icon="plus"
            style={{ marginTop: 10 }}
          >
            Add Character
          </Button>
          <ScrollView style={{ maxHeight: 100, marginTop: 5 }}>
            {names.map((name, index) => (
              <List.Item
                key={index}
                title={name}
                right={() => (
                  <IconButton icon="delete" onPress={() => removeName(index)} />
                )}
              />
            ))}
          </ScrollView>
          <View style={{ marginTop: 10 }} />
          <TextInput
            label="Sources to Fetch"
            placeholder="Enter source URL"
            value={editingSource}
            onChangeText={(text) => setEditingSource(text)}
            style={{ marginTop: 5 }}
            ref={inputRef2}
          />
          <Button
            onPress={addSource}
            mode="contained"
            icon="plus"
            style={{ marginTop: 10 }}
          >
            Add Source
          </Button>
          <ScrollView style={{ maxHeight: 100, marginTop: 5 }}>
            {sourcesToFetch.map((source, index) => (
              <List.Item
                key={index}
                title={source}
                right={() => (
                  <IconButton icon="delete" onPress={() => removeSource(index)} />
                )}
              />
            ))}
          </ScrollView>
        </>
      </TouchableWithoutFeedback>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onClose}>Cancel</Button>
      <Button
        onPress={() => {
          onOk({ names, sourcesToFetch });
          onClose();
        }}
        disabled={names.length === 0 || sourcesToFetch.length === 0}
      >
        Add
      </Button>
    </Dialog.Actions>

  </Dialog>
}


function TaskViewDialog({ taskId, raiseMessage, open, onClose }) {
  const [task, setTask] = React.useState({ stagesDescription: { total_stages: [], current_stage: 0 } });
  const refresher = React.useRef(null);

  React.useEffect(() => {
    if (taskId) {
      Api.trackTask(taskId).then(r => {
        if (r.data.status) {
          // read json
          r.data.data.stagesDescription = JSON.parse(r.data.data.stagesDescription)
          setTask(r.data.data)
          let intvId = setInterval(() => {
            Api.trackTask(taskId).then(r => {
              if (r.data.status) {
                r.data.data.stagesDescription = JSON.parse(r.data.data.stagesDescription)
                setTask(r.data.data)
              }
            })
          }, 1000)
          refresher.current = intvId
        } else {
          raiseMessage('Error', `Failed to get task ${taskId}: ${r.data.data}`, 'error')
        }
      }).catch(e => {
        raiseMessage('Error', `Failed to get task ${taskId}: ${e}`, 'error')
      })
    }
    return () => {
      if (refresher.current) {
        clearInterval(refresher.current)
      }
    }
  }, [taskId])
  React.useEffect(() => {
    if (task.status === 'completed' || task.status === 'failed') {
      console.log('clear interval', refresher.current)
      if (refresher.current) {
        clearInterval(refresher.current)
      }
    }
  }, [task])

  return <Portal>
    <Dialog onDismiss={onClose} visible={open}>
      <Dialog.Title>
        Task #{taskId} details
      </Dialog.Title>
      <Dialog.Content>
        <ScrollView style={{ maxHeight: 200 }}>
          <View>
            <Text variant='titleMedium'>Begin Time: </Text>
            <Text variant='bodyMedium' >{task.creationTime}</Text>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text variant='titleMedium'>End Time: </Text>
            <Text variant='bodyMedium' >{task.completionTime}</Text>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text variant='titleMedium'>Current Stage: </Text>
            <Text variant='bodyMedium' >{task.stagesDescription.current_stage}: {task.stagesDescription.total_stages[task.stagesDescription.current_stage - 1]}</Text>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text variant='titleMedium'>Status: </Text>
            <Text variant='bodyMedium' >{task.status}</Text>
          </View>
          <Text variant='titleMedium' style={{ marginTop: 10 }}>
            Task Log:
          </Text>
          <Text>
            {task.log}
          </Text>
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onClose}>Close</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
}


function PanelModels({ middlewareInfo, raiseMessage, setAddNewCharacterOpen }) {
  const [tableContent, setTableContent] = React.useState([]);

  React.useEffect(() => {
    let r = []
    if (middlewareInfo && middlewareInfo.models_path) {
      for (let i in middlewareInfo.models_path) {
        r.push({
          name: i,
          paths: middlewareInfo.models_path[i]
        })
        console.log({
          name: i,
          paths: middlewareInfo.models_path[i]
        })
      }
      setTableContent(r)
    } else {
      setTableContent([])
    }

  }, [middlewareInfo])
  return <ScrollView style={{ height: '100%', paddingHorizontal: 10 }}>
    <Text variant="bodyMedium" style={{ marginTop: 10 }}>
      A GPT-SoViTs middleware is the web interface of AIDub that integrated one-key voice dataset preprocessing and voice model training,
      which can significantly reduce the workload of data preparation and model training for users.
    </Text>
    <View style={{ marginTop: 20 }} />
    <View >
      <List.Subheader>Available models</List.Subheader>
      {tableContent.map((item, index) => (
        <List.Accordion
          key={index}
          title={item.name}
          left={props => <List.Icon {...props} icon="server-network" />}
        >
          <List.Item title={`GPT model path`} description={item.paths[0]} />
          <List.Item title={`SoVITs model path`} description={item.paths[1]} />
        </List.Accordion>
      ))}
      <View style={{ marginTop: 20 }} />
    </View>

  </ScrollView>
}


function PanelTasks({ middlewareInfo, raiseMessage, setTaskViewOpen, setTaskViewId }) {
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    Api.getMiddlewareTasks().then(r => {
      if (r.data.status) {
        r.data.data.forEach(e => {
          try {
            e.stagesDescription = JSON.parse(e.stagesDescription)
          } catch (err) {
            e.stagesDescription = { total_stages: [], current_stage: 0 } // handle potential parse error
          }
        })
        setTasks(r.data.data);
      } else {
        raiseMessage('Error', `Failed to get tasks: ${r.data.data}`, 'error')
      }
    }).catch(e => {
      raiseMessage('Error', `Failed to get tasks: ${e}`, 'error')
    });
  }, [])

  const deleteTask = (taskId) => {
    Api.deleteMiddlewareTask(taskId).then(r => {
      if (r.data.status) {
        setTasks(tasks.filter(e => e.id !== taskId))
        raiseMessage('Success', `Task ${taskId} deleted successfully`, 'success')
      } else {
        raiseMessage('Error', `Failed to delete task ${taskId}: ${r.data.data}`, 'error')
      }
    }).catch(e => {
      raiseMessage('Error', `Failed to delete task ${taskId}: ${e}`, 'error')
    })
  }

  return <ScrollView style={{ height: '100%', paddingHorizontal: 10 }}>
    <Text variant="bodyLarge" style={{ marginTop: 10 }}>
      Check all training tasks on GPT-SoViTs middleware.
    </Text>
    <View style={{ marginTop: 20 }} />
    <List.Section>
      <List.Subheader>All Tasks</List.Subheader>
      {tasks.map((task, index) => (
        <List.Item
          onPress={() => {
            setTaskViewId(task.id)
            setTaskViewOpen(true)
          }}
          key={index}
          title={`Task ID: ${task.id}`}
          description={`Status: ${task.status} | Progress: ${task.stagesDescription.current_stage} / ${task.stagesDescription.total_stages.length} | Begin Time: ${task.creationTime}`}
          left={props => <List.Icon {...props} icon="clipboard-check" />}
          right={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton icon="delete" onPress={() => deleteTask(task.id)} />
            </View>
          )}
        />
      ))}
    </List.Section>
  </ScrollView>
}


function TTSModel({ }) {
  const [middlewareInfo, setMiddlewareInfo] = React.useState({});
  // message related
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState('')

  const [currentPanel, setCurrentPanel] = React.useState('models');
  const [addNewCharacterOpen, setAddNewCharacterOpen] = React.useState(false);
  const [taskViewOpen, setTaskViewOpen] = React.useState(false);
  const [taskViewId, setTaskViewId] = React.useState(null);
  const [fabVisible, setFabVisible] = React.useState(true);


  const loadMiddlewareInfo = () => {
    Api.getMiddlewareInfo().then(r => {
      if (r.data.status) {
        setMiddlewareInfo(r.data.data);
      } else {
        if (r.data.data === "Middleware not configured") {
          setMiddlewareInfo({});
          return;
        }
        setMessageText(`Failed to get middleware info: ${r.data.data}`);
        setMessageState(true);
      }
    }).catch(e => {
      console.error(e);
      setMessageText(`Failed to get middleware info: ${e}`);
      setMessageState(true);
    });
  }

  useFocusEffect(React.useCallback(() => {
    loadMiddlewareInfo();
  }, []));


  const raiseMessage = (title, content, type) => {
    setMessageText(`${title}: ${content}`);
    setMessageState(true);
  };

  const togglePanel = () => {
    setCurrentPanel(currentPanel === 'models' ? 'tasks' : 'models');
  };

  const getFabIcon = () => {
    return currentPanel === 'models' ? 'clipboard-check' : 'folder';
  };
  const getFabLabel = () => {
    return currentPanel === 'models' ? 'Tasks' : 'Models';
  };


  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.Content title={'GPT-SoViTs Middleware'}></Appbar.Content>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => {
          console.log('pressed')
        }}>
          <View style={{ flex: 1 }}>
            {middlewareInfo && Object.keys(middlewareInfo).length === 0 && <NotConfigured />}
            {middlewareInfo && Object.keys(middlewareInfo).length > 0 && currentPanel === 'models' && (
              <PanelModels
                middlewareInfo={middlewareInfo}
                raiseMessage={raiseMessage}
                setAddNewCharacterOpen={setAddNewCharacterOpen}
              />
            )}
            {middlewareInfo && Object.keys(middlewareInfo).length > 0 && currentPanel === 'tasks' && (
              <PanelTasks
                middlewareInfo={middlewareInfo}
                raiseMessage={raiseMessage}
                setTaskViewOpen={setTaskViewOpen}
                setTaskViewId={setTaskViewId}
              />
            )}

            <Portal>
              <AddNewCharacterDialog
                open={addNewCharacterOpen}
                onOk={(data) => {
                  Api.runTraining(data.names, data.sourcesToFetch).then(r => {
                    if (r.data.status) {
                      raiseMessage('Success', `Training task for ${data.names.join(',')} submitted successfully`, 'success')
                      loadMiddlewareInfo(); // Refresh tasks after training starts
                    } else {
                      raiseMessage('Error', `Failed to submit training task: ${r.data.data}`, 'error')
                    }
                  }).catch(e => {
                    raiseMessage('Error', `Failed to submit training task: ${e}`, 'error')
                  })
                }}
                onErr={(err) => {
                  raiseMessage('Error', `Failed to add new character: ${err}`, 'error')
                }}
                onClose={() => {
                  setAddNewCharacterOpen(false);
                }}
              />
              <TaskViewDialog
                taskId={taskViewId}
                open={taskViewOpen}
                onClose={() => {
                  setTaskViewOpen(false)
                }}
                raiseMessage={raiseMessage}
              />
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
            {middlewareInfo && Object.keys(middlewareInfo).length > 0 && <FAB
              visible={fabVisible}
              icon={getFabIcon()}
              label={getFabLabel()}
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
              }}
              onPress={togglePanel}
              onLongPress={() => setAddNewCharacterOpen(true)} // Long press to add new character as in desktop client
            />}
          </View>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  );
}

const IconButton = withTheme(({ icon, color, size = 24, onPress }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Icon source={icon} color={color} size={size} />
    </View>
  </TouchableWithoutFeedback>
));


export default withTheme(TTSModel);