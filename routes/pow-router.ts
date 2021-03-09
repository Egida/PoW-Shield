import Koa from 'koa'
import Router from 'koa-router'

import Pow from '../service/pow-service'
import config from '../service/config-parser'

const router = new Router()
const pow = new Pow(config.get()['initial_difficulty'])

router.prefix('/pow')

router.get('/', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  const { difficulty, prefix } = await pow.getProblem()
  Object.assign(ctx.session, { difficulty, prefix })
  await ctx.render('pow', {
    difficulty,
    prefix,
    redirect: ctx.query.redirect,
  })
})

router.post('/', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  if (await pow.parseAndVerify(ctx.request.body, ctx.session)) {
    ctx.session.authorized = true
    ctx.status = 200
  } else {
    Object.assign(ctx.session, { difficulty: null, prefix: null })
    ctx.status = 401
  }
})

export default router