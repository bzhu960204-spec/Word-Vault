import client from './client'

export const summary = () => client.get('/stats/summary').then((r) => r.data)
export const daily = (days = 30) => client.get('/stats/daily', { params: { days } }).then((r) => r.data)
