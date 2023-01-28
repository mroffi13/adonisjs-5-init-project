import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserMeta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: Number

  @column()
  public meta_key: string

  @column()
  public meta_value: JSON

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
