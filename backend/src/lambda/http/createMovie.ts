import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateMovieRequest } from '../../models/requests/CreateMovieRequest'
import { createMovie } from '../../businessLogic/movies'
import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';


const logger = createLogger('createMovie')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('createMovie event', { event })

    try {
      const newMovie: CreateMovieRequest = JSON.parse(event.body)
      const userId = event.requestContext.authorizer.principalId
      const response = await createMovie(userId, newMovie)

      return {
        statusCode: CREATED_STATUS_CODE,
        body: JSON.stringify({
          item: {
            ...response
          }
        })
      }

    } catch (e) {

      logger.error('Error - createMovie: ' + e.message)

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
