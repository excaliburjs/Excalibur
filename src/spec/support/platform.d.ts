interface IOS {
  toString(): string;
  architecture: number | null;
  family: string | null;
  version: string | null;
}

interface IPlatform {
  name: string;
  version: string;
  os: IOS;
  description: string;
  parse(uaString: string): IPlatform;
}
declare var platform: IPlatform;
