export class InvalidRequestData extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidRequestData'
  }
}
