import { Request, Response as NodeFetchResponse } from 'node-fetch';

import { StatusCodes, HeaderNames } from './constants';

export class DiscordBioError extends Error {
    public readonly request: Request
    public readonly response: NodeFetchResponse
    constructor (text: string, request: Request, response: NodeFetchResponse) {
      super(text);
      this.request = request;
      this.response = response;
    }

    get statusCode (): number {
      return this.response.status;
    }
}

export class RatelimitError extends DiscordBioError {
  constructor (text: string, request: Request, response: NodeFetchResponse) {
    super(text, request, response);
    if (response.status !== StatusCodes.RATELIMIT) {
      throw new Error(`Invalid ratelimit status code: ${response.status}. Expected: ${StatusCodes.RATELIMIT}`);
    }
  }

  private fetchRatelimitHeader (header: string): number | null {
    const rawReset = this.response.headers.get(header);
    if (!rawReset) return null;
    const intReset = parseInt(rawReset);
    return intReset;
  }

  get limit () {
    return this.fetchRatelimitHeader(HeaderNames.RATELIMIT_LIMIT);
  }

  get remaining () {
    return this.fetchRatelimitHeader(HeaderNames.RATELIMIT_REMAINING);
  }

  get reset () {
    return this.fetchRatelimitHeader(HeaderNames.RATELIMIT_RESET);
  }

  get statusCode (): number {
    return StatusCodes.RATELIMIT;
  }
}
