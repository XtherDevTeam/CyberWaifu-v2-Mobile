import axios from "axios"
import * as storage from './storage'

let serverUrl = ""

function refreshServerUrl() {
  storage.inquireItem("serverAddress", (r, v) => {
    if (!r) {
      serverUrl = null
    } else {
      serverUrl = v
    }
  })
}

refreshServerUrl()

function checkIfLoggedIn() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    if (r.data.data.authenticated_session === -1) {
      storage.removeItem('loginStatus', r => { })
    }
    return r.data.data.authenticated_session !== -1
  }).catch(r => {
    return false;
  })
}

function getUserName() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    return r.data.data.session_username
  }).catch(r => {
    return 'guest'
  })
}

function checkIfInitialized() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    return r.data.data.initialized
  }).catch(r => { throw r })
}

function initialize(username, password) {
  return axios.post(`${serverUrl}/api/v1/initialize`, {
    userName: username,
    password
  })
}

function signIn(password) {
  return axios.post(`${serverUrl}/api/v1/user/login`, {
    password
  }).then(r => {
    if (r.data.status) {
      storage.setItem('loginStatus', true, r => { })
    }
    return r
  })
}

function characterList() {
  return axios.post(`${serverUrl}/api/v1/char_list`)
}

function chatEstablish(charName, msgChain) {
  return axios.post(`${serverUrl}/api/v1/chat/establish`, {
    charName,
    msgChain
  })
}

function chatMessage(session, msgChain) {
  return axios.post(`${serverUrl}/api/v1/chat/message`, {
    session,
    msgChain
  })
}

function chatTerminate(session) {
  return axios.post(`${serverUrl}/api/v1/chat/terminate`, {
    session
  })
}

function attachmentUploadAudio(audioFile) {
  const formData = new FormData()
  formData.append('audio_file', audioFile)
  return axios.post(`${serverUrl}/api/v1/attachment/upload/audio`, formData)
}

function attachmentUploadImage(imageFile) {
  const formData = new FormData()
  formData.append('image_file', imageFile)
  return axios.post(`${serverUrl}/api/v1/attachment/upload/image`, formData)
}

function attachmentDownload(attachmentId) {
  return axios.post(`${serverUrl}/api/v1/attachment/${attachmentId}`)
}

function charAvatar(charId) {
  console.log(`${serverUrl}/api/v1/char/${charId}/avatar`)
  return `${serverUrl}/api/v1/char/${charId}/avatar`
}

function charHistory(charId, offset = 0) {
  return axios.post(`${serverUrl}/api/v1/char/${charId}/history/${offset}`)
}

function charNew(charName, charPrompt, pastMemories, exampleChats) {
  return axios.post(`${serverUrl}/api/v1/char/new`, {
    charName,
    charPrompt,
    pastMemories,
    exampleChats
  })
}

export {
  checkIfLoggedIn, checkIfInitialized, signIn, refreshServerUrl, initialize,
  characterList, chatEstablish, chatMessage, chatTerminate,
  attachmentUploadAudio, attachmentUploadImage, attachmentDownload,
  charNew, charAvatar, charHistory, getUserName
}