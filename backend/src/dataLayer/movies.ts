import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'

import { MovieItem } from '../models/movies/MovieItem'
import { MovieUpdate } from '../models/movies/MovieUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('dataLayer-movies')

const XAWS = AWSXRay.captureAWS(AWS)

export class MoviesAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly moviesTable = process.env.MOVIES_TABLE,
    private readonly moviesByUserIndex = process.env.MOVIES_BY_USER_INDEX
    
  ) { }


  async movieItemExists(movieId: string): Promise<boolean> {
    const item = await this.getMovieItem(movieId)
    return !!item
  }

  async getMoviesByUserId(userId: string): Promise<MovieItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.moviesTable,
        IndexName: this.moviesByUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    logger.info(`All movies for user ${userId} were fetched`)

    return items as MovieItem[]
  }

  async getMovieItem(movieId: string): Promise<MovieItem> {
    const result = await this.docClient
      .get({
        TableName: this.moviesTable,
        Key: {
          movieId
        }
      })
      .promise()

    const item = result.Item

    logger.info(`Movie item ${item} was fetched`)

    return item as MovieItem
  }

  async createMovieItem(movieItem: MovieItem): Promise<void> {
    await this.docClient
      .put({
        TableName: this.moviesTable,
        Item: movieItem
      })
      .promise()

    logger.info(`Movie item ${movieItem.movieId} was created`)
  }

  async updateMovieItem(
    movieId: string,
    movieUpdate: MovieUpdate
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.moviesTable,
        Key: {
          movieId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': movieUpdate.name,
          ':dueDate': movieUpdate.dueDate,
          ':done': movieUpdate.done
        }
      })
      .promise()

    logger.info(`Movie item ${movieId} was updated`)
  }

  async deleteMovieItem(movieId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.moviesTable,
        Key: {
          movieId
        }
      })
      .promise()

    logger.info(`Movie item ${movieId} deleted!`)
  }

  async updateAttachmentUrl(
    movieId: string,
    attachmentUrl: string
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.moviesTable,
        Key: {
          movieId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()

    logger.info(`Attachment URL for todo ${movieId} was updated`)
  }
}



