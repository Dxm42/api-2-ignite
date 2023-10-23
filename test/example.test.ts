import { test, beforeAll, afterAll}  from "vitest" 
import request from "supertest"
import { app } from "../src/app"

// Verifica se asfunções asyncronas terminaram de executar antes de realizar os testes
beforeAll(async ()=>{
  await app.ready()
})
// Fecha a aplicação  depois que os testes terminarem  de executar
afterAll(async () => {
  await app.close()
})
test('User can create a new transaction', async ()=>{
    await request(app.server)
    .post('/transactions')
    .send({
    title: 'New transaction',
    amount:5000,
    type: 'credit'
  })
  .expect(201)
})