import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteMovie } from '../../businessLogic/movies'
import { createLogger } from '../../utils/logger'
import { NO_CONTENT, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('deleteMovie')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('deleteMovie event', { event })

    try {

      const movieId = event.pathParameters.movieId
      const userId = event.requestContext.authorizer.principalId

      await deleteMovie(userId, movieId)

      return {
        statusCode: NO_CONTENT,
        body: ''
      }

    }catch(e) {
      logger.error('Error - deleteMovie: ' + e.message)

      return {
        statusCode: SERVER_ERROR_STATUS_CODE,
        body: e.message
      }
    }

    
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
