import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as Joi from 'joi';

const ENCODINGS = ['hex', 'binary', 'base64', 'base64url', 'buffer'] as const;
const HASH_ALGORITHMS = ['sha1', 'md5', 'sha256', 'sha512'] as const;
const HMAC_ALGORITHMS = [
  'aes-128-cbc',
  'aes-192-cbc',
  'aes-256-cbc',
  'des-cbc',
  'des-ede-cbc',
  'des-ede3-cbc',
  'bf-cbc',
  'bf-ecb',
  'bf-ofb',
] as const;

type TEncodings = (typeof ENCODINGS)[number];
type THashEncodings = TEncodings[] | '*';
type THashAlgorithms = (typeof HASH_ALGORITHMS)[number];
type THmacAlgorithms = (typeof HMAC_ALGORITHMS)[number];

export class HasherHelper {
  readonly encodings = new Set(ENCODINGS);
  readonly hash_algorithm = new Set(HASH_ALGORITHMS);

  static async bcryptHash(strToHash: string): Promise<string> {
    const saltRounds = 16;
    return await bcrypt.hash(strToHash, saltRounds);
  }

  static async bcryptCompare(strToCompare: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(strToCompare, hash);
  }

  static async hash(
    strToHash: string,
    options?: {
      addSalt?: boolean;
      saltOrRounds?: string;
      algorithm?: THashAlgorithms;
      encodings?: THashEncodings;
    },
  ) {
    const defaultSaltRounds = 16;
    const {
      addSalt = true,
      saltOrRounds = defaultSaltRounds,
      algorithm = 'sha256',
      encodings = ['hex'],
    } = options || {};

    const shasum = crypto.createHash(algorithm);
    let salt = '';

    if (addSalt)
      salt =
        typeof saltOrRounds === 'string'
          ? saltOrRounds
          : typeof saltOrRounds === 'number'
            ? await HasherHelper.genSalt(saltOrRounds)
            : await HasherHelper.genSalt(defaultSaltRounds);

    shasum.update(String(strToHash) + salt);

    return {
      hash: new HasherHelper().encode(shasum, encodings),
      salt,
    };
  }

  static hmac(
    strToHash: string,
    secret: string,
    options?: {
      algorithm?: THashAlgorithms;
      encodings?: THashEncodings;
    },
  ) {
    const { algorithm = 'sha256', encodings = ['hex'] } = options || {};

    const hmac = crypto.createHmac(algorithm, secret);

    hmac.update(String(strToHash));
    return new HasherHelper().encode(hmac, encodings);
  }

  //static async encrypt(
  //  strToEncrypt: string,
  //  secret: string,
  //  options?: {
  //    iv?: string;
  //    algorithm?: THmacAlgorithms;
  //    encodings?: THashEncodings;
  //  },
  //) {
  //  const {
  //    iv,
  //    algorithm = 'aes-256-cbc',
  //    encodings = ['hex'],
  //  } = options || {};

  //  let cipher: crypto.Cipher | crypto.CipherCCM;

  //  if (!iv) cipher = crypto.createCipher(algorithm, secret);
  //  else {
  //    const encryptedIV = await HasherHelper.hash(iv, {
  //      addSalt: false,
  //      encodings: ['hex'],
  //    });
  //    cipher = crypto.createCipheriv(algorithm, secret, encryptedIV.hash.hex);
  //  }

  //  let encrypted = cipher.update(strToEncrypt, 'utf-8', 'hex');
  //  encrypted += cipher.final('hex');

  //  return new HasherHelper().encode(encrypted, encodings);
  //}

  //static async decrypt(
  //  strToDecrypt: string,
  //  secret: string,
  //  options?: {
  //    iv?: string;
  //    algorithm?: THmacAlgorithms;
  //    encoding?: TEncodings;
  //  },
  //) {
  //  const { iv, algorithm = 'aes-256-cbc', encoding = 'hex' } = options || {};

  //  let decipher: crypto.Decipher;

  //  if (!iv) decipher = crypto.createDecipher(algorithm, secret);
  //  else {
  //    const encryptedIV = await HasherHelper.hash(iv, {
  //      addSalt: false,
  //      encodings: ['hex'],
  //    });
  //    decipher = crypto.createDecipheriv(
  //      algorithm,
  //      secret,
  //      encryptedIV.hash.hex,
  //    );
  //  }

  //  //let decoded = '';
  //  let decrypted: Buffer;
  //  const badEncodingExceptionMessage =
  //    'The string to decrypt is not encoded in the specified encoding:';

  //  if (encoding === 'buffer') {
  //    if (!Buffer.isBuffer(strToDecrypt)) {
  //      throw new Error(
  //        `${badEncodingExceptionMessage} ${encoding}`,
  //      );
  //    }

  //    //decoded = strToDecrypt.toString('utf-8');
  //    decrypted = decipher.update(strToDecrypt);
  //  } else {
  //    if (encoding === 'hex' || encoding === 'base64') {
  //      const schema = Joi.string()[encoding]();
  //      const { error } = schema.validate(strToDecrypt);

  //      if (error) {
  //        throw new Error(
  //          `${badEncodingExceptionMessage} ${encoding}`,
  //        );
  //      }
  //    } else {
  //      const isValidBase64UrlOrBinary = (str: any) => {
  //        const base64UrlRegex = /^[A-Za-z0-9_-]*$/;
  //        const binaryRegex = /^[01]*$/;

  //        return base64UrlRegex.test(str) || binaryRegex.test(str);
  //      };

  //      if (!isValidBase64UrlOrBinary(strToDecrypt)) {
  //        throw new Error(
  //          `${badEncodingExceptionMessage} ${encoding}`,
  //        );
  //      }
  //    }
  //    //decoded = Buffer.from(strToDecrypt, encoding).toString('utf-8');
  //    decrypted = decipher.update(strToDecrypt, encoding);
  //  }

  //  //let decrypted = decipher.update(decoded, 'hex', 'utf8');
  //  decrypted = Buffer.concat([decrypted, decipher.final()]);
  //  return decrypted.toString('utf-8');
  //}

  static genSalt(rounds: number) {
    return bcrypt.genSalt(rounds);
  }

  protected encode(
    sum: crypto.Hash | crypto.Hmac | string,
    encodings: THashEncodings,
  ) {
    const schema = Joi.string().hex();
    const { error } = schema.validate(sum);

    if (
      !(sum instanceof crypto.Hash) &&
      !(sum instanceof crypto.Hmac) &&
      error
    ) {
      throw new Error(
        "sum can't be " +
        typeof sum +
        '. Must be an instance of these crypto class ' +
        `${crypto.Hash.name}, ${crypto.Hmac.name} or a hex string.`,
      );
    }

    if (encodings === '*') encodings = [...this.encodings];
    if (encodings.length === 0) encodings = ['hex'];

    const digests: {
      hex?: string;
      binary?: string;
      base64?: string;
      base64url?: string;
      buffer?: Buffer;
    } = {};

    const sEncodings = new Set(encodings);

    if (typeof sum === 'string')
      sEncodings.forEach((encoding) => {
        if (encoding === 'hex') digests[encoding] = sum;
        else {
          const buffer = Buffer.from(sum, 'hex');

          if (encoding === 'buffer') digests[encoding] = buffer;
          else digests[encoding] = buffer.toString(encoding);
        }
      });
    else
      sEncodings.forEach((encoding) => {
        //FIX: Digest already called after first iteration
        if (encoding === 'buffer') digests[encoding] = sum.digest();
        else digests[encoding] = sum.digest(encoding) as string;
      });

    return digests;
  }
}

//(async () => {
//  const res = await HasherHelper.hash('Hello World', {
//    addSalt: false,
//    encodings: ['binary'],
//  });

//  console.log(res);
//})()

//(async () => {
//  const enc = await HasherHelper.encrypt(
//    'Hello World',
//    ' reply to +14702316765 with AUTH | CODE: $2b$16$23d1t8Xti4tPyyJaQPhr1Oa9TNlPnwKvsRYjCcMj7RYk9SLc9/9om; ID: 78c61e3796;',
//  );
//  console.log(enc);

//  const dec = await HasherHelper.decrypt(
//    enc.hex,
//    ' reply to +14702316765 with AUTH | CODE: $2b$16$23d1t8Xti4tPyyJaQPhr1Oa9TNlPnwKvsRYjCcMj7RYk9SLc9/9om; ID: 78c61e3796;',
//  );
//  console.log(dec);
//})();
