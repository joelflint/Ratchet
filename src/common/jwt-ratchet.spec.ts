import { JwtRatchet } from './jwt-ratchet';

describe('#jwtRatchet', function () {
  it('should test round-trip for a token', async () => {
    const jwt: JwtRatchet = new JwtRatchet(Promise.resolve('test1234'), Promise.resolve([]));

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const output: any = await jwt.decodeToken(token1);

    expect(output).not.toBeNull();
    expect(output['test']).toEqual(1);
  });

  it('should test round-trip for a token with array enc keys', async () => {
    const jwt: JwtRatchet = new JwtRatchet(Promise.resolve(['test1234', 'test5678']), Promise.resolve([]));

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const token2: string = await jwt.createTokenString({ test: 1 }, 120);
    const token3: string = await jwt.createTokenString({ test: 1 }, 120);
    const output1: any = await jwt.decodeToken(token1);
    const output2: any = await jwt.decodeToken(token2);
    const output3: any = await jwt.decodeToken(token3);

    expect(output1).not.toBeNull();
    expect(output1['test']).toEqual(1);
    expect(output2).not.toBeNull();
    expect(output2['test']).toEqual(1);
    expect(output3).not.toBeNull();
    expect(output3['test']).toEqual(1);
  });

  it('should decode with a decode key', async () => {
    const jwtOld: JwtRatchet = new JwtRatchet(Promise.resolve('oldKey'), Promise.resolve([]));
    const jwtNew: JwtRatchet = new JwtRatchet(Promise.resolve('newKey'), Promise.resolve(['oldKey']));

    const token1: string = await jwtOld.createTokenString({ test: 1 }, 120);
    const output: any = await jwtNew.decodeToken(token1);

    expect(output).not.toBeNull();
    expect(output['test']).toEqual(1);
  });
});
