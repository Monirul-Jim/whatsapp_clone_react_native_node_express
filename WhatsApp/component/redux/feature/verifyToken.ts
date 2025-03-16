import {jwtDecode} from 'jwt-decode';

const verifyToken = (token: string) => {
  const decoded: any = jwtDecode(token);
  return decoded;
};

export default verifyToken;
