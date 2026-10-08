import client from './client'

export const listWords = (params) => client.get('/words', { params }).then((r) => r.data)
export const getWord = (id) => client.get(`/words/${id}`).then((r) => r.data)
export const createWord = (data) => client.post('/words', data).then((r) => r.data)
export const updateWord = (id, data) => client.put(`/words/${id}`, data).then((r) => r.data)
export const deleteWord = (id) => client.delete(`/words/${id}`).then((r) => r.data)
export const listTags = () => client.get('/words/tags').then((r) => r.data)
export const createCardForWord = (id, type = 'EN_TO_CN') =>
  client.post(`/words/${id}/cards`, { type }).then((r) => r.data)
export const importWords = (data) => client.post('/words/import', data).then((r) => r.data)
