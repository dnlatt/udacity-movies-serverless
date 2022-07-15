import 'source-map-support/register'
import * as uuid from 'uuid'
import { MoviesAccess } from '../dataLayer/movies'

import { getUploadUrl, getAttachmentUrl } from '../storageLayer/movies'

import { MovieItem } from '../models/movies/MovieItem'
import { MovieUpdate } from '../models/movies/MovieUpdate'
import { CreateMovieRequest } from '../models/requests/CreateMovieRequest'
import { UpdateMovieRequest } from '../models/requests/UpdateMovieRequest'

import { createLogger } from '../utils/logger'
import CustomError from '../utils/CustomError'
import {FORBIDDEN_STATUS_CODE, SERVER_ERROR_STATUS_CODE, PAGE_NOT_FOUND_STATUS_CODE} from '../utils/constants'

const moviesAccess = new MoviesAccess()
const logger = createLogger('businessLogic-movies')

export async function getMovies(
  userId: string
): Promise<MovieItem[] | CustomError> {
  try {
    const movies = await moviesAccess.getMoviesByUserId(userId)
    logger.info(`Movies of user: ${userId}`, JSON.stringify(movies))
    return movies
  } catch (error) {
    const errorMsg = `Error occurred when getting user's movies`
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}

export async function createMovie(
  userId: string,
  createMovieRequest: CreateMovieRequest
): Promise<MovieItem | CustomError> {
  const movieId = uuid.v4()

  const newItem: MovieItem = {
    userId,
    movieId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createMovieRequest
  }

  try {
    await moviesAccess.createMovieItem(newItem)
    logger.info(`Movie ${movieId} for user ${userId}:`, {
      userId,
      movieId,
      todoItem: newItem
    })
    return newItem
  } catch (error) {
    const errorMsg = `Error occurred when creating user movie item`
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}

export async function updateMovie(
  userId: string,
  movieId: string,
  updateMovieRequest: UpdateMovieRequest
): Promise<void | CustomError> {
  try {
    const item = await moviesAccess.getMovieItem(movieId)

    if (!item) throw new CustomError('Movie not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to movie item', FORBIDDEN_STATUS_CODE)
    }

    await moviesAccess.updateMovieItem(movieId, updateMovieRequest as MovieUpdate)
    logger.info(`Updating movie ${movieId} for user ${userId}:`, {
      userId,
      movieId,
      todoUpdate: updateMovieRequest
    })
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when updating movie item'
    }
    logger.error(error.message)
    return error
  }
}

export async function deleteMovie(
  userId: string,
  movieId: string
): Promise<void | CustomError> {
  try {
    const item = await moviesAccess.getMovieItem(movieId)

    if (!item) throw new CustomError('Item not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to delete item', FORBIDDEN_STATUS_CODE)
    }

    await moviesAccess.deleteMovieItem(movieId)

    logger.info(`Deleting todo ${movieId} for user ${userId}:`, {
      userId,
      movieId
    })
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function updateAttachmentUrl(
  userId: string,
  movieId: string,
  attachmentId: string
): Promise<void | CustomError> {
  try {
    const attachmentUrl = await getAttachmentUrl(attachmentId)

    const item = await moviesAccess.getMovieItem(movieId)

    if (!item) throw new CustomError('Item not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to update item', FORBIDDEN_STATUS_CODE)
    }

    await moviesAccess.updateAttachmentUrl(movieId, attachmentUrl)

    logger.info(
      `Updating todo ${movieId} with attachment URL ${attachmentUrl}`,
      {
        userId,
        movieId
      }
    )
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export function generateSignedUrl(attachmentId: string): string | CustomError {
  try {
    const uploadUrl = getUploadUrl(attachmentId)
    logger.info(`Presigned Url is generated: ${uploadUrl}`)

    return uploadUrl
  } catch (error) {
    const errorMsg = 'Error occurred when generating presigned Url to upload'
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}
