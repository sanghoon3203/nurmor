import { AuthRequest, makeRedirectUri, Prompt, ResponseType } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export type OAuthProviderId = 'google.com';

export type OAuthProviderCredential = {
  providerId: OAuthProviderId;
  idToken: string;
  requestUri: string;
  nonce: string;
};

const redirectUri = makeRedirectUri({
  scheme: 'atlas',
  path: 'oauth',
});

const providerConfig = {
  'google.com': {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['openid', 'profile', 'email'],
    prompt: Prompt.SelectAccount,
    extraParams: {},
  },
} satisfies Record<
  OAuthProviderId,
  {
    authorizationEndpoint: string;
    scopes: string[];
    prompt?: Prompt;
    extraParams: Record<string, string>;
  }
>;

export async function startOAuthProviderSignIn(
  providerId: OAuthProviderId,
  clientId: string
): Promise<OAuthProviderCredential> {
  if (!clientId.trim()) {
    throw new Error('Google OAuth client ID가 필요합니다.');
  }

  const provider = providerConfig[providerId];
  const nonce = Crypto.randomUUID();
  const request = new AuthRequest({
    clientId,
    redirectUri,
    responseType: ResponseType.IdToken,
    scopes: provider.scopes,
    prompt: provider.prompt,
    usePKCE: false,
    extraParams: {
      ...provider.extraParams,
      nonce,
    },
  });

  const result = await request.promptAsync({ authorizationEndpoint: provider.authorizationEndpoint });

  if (result.type !== 'success') {
    throw new Error(result.type === 'cancel' || result.type === 'dismiss' ? '로그인이 취소되었습니다.' : 'OAuth 로그인이 완료되지 않았습니다.');
  }

  const idToken = result.params.id_token;
  if (!idToken) {
    throw new Error('OAuth provider id_token을 받지 못했습니다.');
  }

  return {
    providerId,
    idToken,
    requestUri: redirectUri,
    nonce,
  };
}
