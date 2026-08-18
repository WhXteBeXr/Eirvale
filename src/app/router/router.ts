import {
  VALID_REALMS,
  VALID_LAYERS,
  DEFAULT_REALM,
} from '@/app/router/router.config.ts';
import type { RealmId } from '@/app/router/router.config.ts';

type RouteHandler = (params: RouteParams) => void;

interface RouteParams {
  realm: string;
  layer: string;
}

class Router {
  private handler: RouteHandler | null = null;

  constructor() {
    globalThis.addEventListener('hashchange', () => this.handleRouteChange());
  }

  onRouteChange(handler: RouteHandler): void {
    this.handler = handler;
    this.handleRouteChange();
  }

  navigate(realm: string, layer: string): void {
    globalThis.location.hash = `#/${realm}/${layer}`;
  }

  private handleRouteChange(): void {
    const params = this.parseHash(globalThis.location.hash);
    if (this.handler) {
      this.handler(params);
    }
  }

  private isValidRealm(value: string | undefined): value is RealmId {
    return VALID_REALMS.includes(value as RealmId);
  }

  private isValidLayer(
    realm: RealmId,
    value: string | undefined,
  ): value is string {
    if (!value) {
      return false;
    }
    return VALID_LAYERS[realm].includes(value); // TODO: Проверить эту систему валидации. Возможно стоит прийти к виду isValidRealm
  }

  private parseHash(hash: string): RouteParams {
    const cleaned = hash.replace(/^#\//, '');
    const segments = cleaned.split('/').filter(Boolean);

    const [realmCandidate, layerCandidate] = segments;

    const realm = this.isValidRealm(realmCandidate)
      ? realmCandidate
      : DEFAULT_REALM;
    const layer = this.isValidLayer(realm, layerCandidate)
      ? layerCandidate
      : (VALID_LAYERS[realm][0] as string);

    return { realm, layer };
  }
}

export const router: Router = new Router();
