import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateMovie } from '../../businessLogic/movies'
import { UpdateMovieRequest } from '../../models/requests/UpdateMovieRequest'

import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('updateMovie')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('updateMovie event', { event })

    try {
      const movieId = event.pathParameters.movieId
      const userId = event.requestContext.authorizer.principalId
      const updatedMovie: UpdateMovieRequest = JSON.parse(event.body)

      await updateMovie(userId, movieId, updatedMovie)

      return {
        statusCode: CREATED_STATUS_CODE,
        body: ''
      }

    } catch (e) {
      logger.error('Error - updateMovie: ' + e.message)

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
