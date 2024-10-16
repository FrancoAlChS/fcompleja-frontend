import { AudiResponse } from '../AudiResponse';

export class OauthResponse{
    audiResponse: AudiResponse;
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
}