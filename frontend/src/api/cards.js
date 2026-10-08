import client from './client'

export const listCards = (params) => client.get('/cards', { params }).then((r) => r.data)
export const deleteCard = (id) => client.delete(`/cards/${id}`).then((r) => r.data)
export const resetCard = (id) => client.post(`/cards/${id}/reset`).then((r) => r.data)
export const batchSetEnabled = (ids, enabled) => client.post('/cards/batch-enabled', { ids, enabled }).then((r) => r.data)
