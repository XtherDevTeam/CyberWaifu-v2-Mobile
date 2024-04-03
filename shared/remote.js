import axios from 'axios';

import * as storage from './storage';

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
  // console.log(`${serverUrl}/api/v1/char/${charId}/avatar`)
  return `${serverUrl}/api/v1/char/${charId}/avatar`
}

function charHistory(charId, offset = 0) {
  return axios.post(`${serverUrl}/api/v1/char/${charId}/history/${offset}`)
}

function charNew(charName, useStickerSet, charPrompt, pastMemories, exampleChats) {
  return axios.post(`${serverUrl}/api/v1/char/new`, {
    charName,
    useStickerSet,
    charPrompt,
    pastMemories,
    exampleChats
  })
}

function getAvatar() {
  return `${serverUrl}/api/v1/avatar`
}

function createStickerSet(setName) {
  return axios.post(`${serverUrl}/api/v1/sticker/create_set`, { setName })
}

function deleteStickerSet(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/delete_set`, { setId })
}

function addStickerToSet(setId, stickerName) {
  return `${serverUrl}/api/v1/sticker/add?setId=${encodeURIComponent(setId)}&stickerName=${encodeURIComponent(stickerName)}`
}

function deleteSticker(stickerId) {
  return axios.post(`${serverUrl}/api/v1/sticker/delete`, { stickerId })
}

function renameStickerSet(setId, newSetName) {
  return axios.post(`${serverUrl}/api/v1/sticker/rename_set`, { setId, newSetName })
}

function stickerGet(setId, name) {
  return `${serverUrl}/api/v1/sticker/get?setId=${encodeURIComponent(setId)}&name=${encodeURIComponent(name)}`
}

function stickerSetList() {
  return axios.post(`${serverUrl}/api/v1/sticker/set_list`)
}

function stickerList(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/list`, { setId })
}

function editCharacter(id, charName, charPrompt, pastMemories, exampleChats, useStickerSet) {
  return axios.post(`${serverUrl}/api/v1/char/${id}/edit`, {
    useStickerSet,
    charName,
    charPrompt,
    pastMemories,
    exampleChats,
  })
}

function getCharacterInfo(id) {
  return axios.post(`${serverUrl}/api/v1/char/${id}/info`)
}

function getStickerSetInfo(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/set_info`, {setId})
}

function splitEmotionAndText(emotions, text) {
  // Construct the regular expression pattern
  const pattern = new RegExp("\\((?:" + emotions.join("|") + ")\\)", "g");

  // Split the text using the pattern
  const splited = text.split(pattern);

  // Create the result array
  const result = [];
  let resultIndex = 0;

  // Iterate through matches and add to the result
  for (const match of text.matchAll(pattern)) {
    result.push(`text:${splited[resultIndex]}`);
    result.push(`emo:${match[0].substring(1, match[0].length - 1)}`); // Extract the emotion without parentheses
    resultIndex++;
  }
  if (resultIndex < splited.length) {
    result.push(`text:${splited[resultIndex]}`);
  }

  return result;
}

export {
  addStickerToSet,
  attachmentDownload,
  attachmentUploadAudio,
  attachmentUploadImage,
  characterList,
  charAvatar,
  charHistory,
  charNew,
  chatEstablish,
  chatMessage,
  chatTerminate,
  checkIfInitialized,
  checkIfLoggedIn,
  createStickerSet,
  deleteSticker,
  deleteStickerSet,
  editCharacter,
  getAvatar,
  getCharacterInfo,
  getStickerSetInfo,
  getUserName,
  initialize,
  refreshServerUrl,
  renameStickerSet,
  signIn,
  splitEmotionAndText,
  stickerGet,
  stickerList,
  stickerSetList,
};