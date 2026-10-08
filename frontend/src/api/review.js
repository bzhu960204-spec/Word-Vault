import client from './client'

export const dueCards = () => client.get('/review/due').then((r) => r.data)
export const practiceCards = (params) => client.get('/review/practice', { params }).then((r) => r.data)
export const submitReview = (cardId, rating) =>
  client.post(`/review/${cardId}`, { rating }).then((r) => r.data)
