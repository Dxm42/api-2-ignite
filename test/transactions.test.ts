import { expect, test, beforeAll, afterAll, describe, beforeEach}  from "vitest" 
import { execSync } from 'node:child_process'
import request from "supertest"
import { app } from "../src/app"

describe('Transactions routes', () => {
    // Verifica se asfunções asyncronas terminaram de executar antes de realizar os testes
  beforeAll(async ()=>{
    await app.ready()
  })
  // Fecha a aplicação  depois que os testes terminarem  de executar
  afterAll(async () => {
    await app.close()
  })
  // Reseta e cadastra as tabelas no banco dados antes de iniciar teste
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  test('User can list to all transactions',  async ()=> {
    const createTransactionsResponse =  await request(app.server)
      .post('/transactions')
      .send({
      title: 'New transaction',
      amount:5000,
      type: 'credit'
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')    
    
    const listTransactionsResponse =  await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    ])
  })


  test('Should be able to a get a specific transactions',  async ()=> {
    const createTransactionsResponse =  await request(app.server)
      .post('/transactions')
      .send({
      title: 'New transaction',
      amount:5000,
      type: 'credit'
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')    
    
    const listTransactionsResponse =  await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const  getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)
    .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    )
  })

  test('Should be able to get the summary',  async ()=> {
    const createTransactionsResponse =  await request(app.server)
      .post('/transactions')
      .send({
      title: 'New transaction',
      amount:5000,
      type: 'credit'
    })
    const cookies = createTransactionsResponse.get('Set-Cookie')    
    
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
      title: 'Debit transaction',
      amount:2000,
      type: 'debit'
    })
    const summarysResponse =  await request(app.server)
    .get('/transactions/summary')
    .set('Cookie', cookies)
    .expect(200)

    expect(summarysResponse.body.summary).toEqual({
      amount: 3000
    })
  })
})
