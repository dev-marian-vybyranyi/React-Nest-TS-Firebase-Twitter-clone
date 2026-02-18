export class PostUpdatedEvent {
  constructor(public readonly oldPhotoUrl: string | null) {}
}
