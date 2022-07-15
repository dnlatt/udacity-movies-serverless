import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getMovies } from '../../businessLogic/movies'
import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('getMovies')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getMovies event', { event })

    const userId = event.requestContext.authorizer.principalId

    try {
      const items = await getMovies(userId)
      return {
        statusCode: CREATED_STATUS_CODE,
        body: JSON.stringify({
          items
        })
      }
    } catch(e) {

      logger.error('Error - getMovies: ' + e.message)

      return {
        statusCode: SERVER_ERROR_STATUS_CODE,
        body: e.message
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
