"use server";

import { sha512 } from 'js-sha512';

// Utility functions
function _internal_hash(hash: string, salt: string) {
  return sha512(hash + salt);
}

function _internal_verify(hashed: string, salt: string, hash_to_check: string) {
  return hash_to_check === _internal_hash(hashed, salt);
}

function _internal_typecheck_hash() {
  const salt = process.env.DATABASE_PASSWORD_SALT;

  if (!salt) {
    throw new Error('DATABASE_PASSWORD_SALT is not set');
  }

  return salt;
}

// exposed functions
export function hash(hash: string) {
  const salt = _internal_typecheck_hash();
  return _internal_hash(hash, salt);
}

export function verify(hashed: string, hash_to_check: string) {
  const salt = _internal_typecheck_hash();
  return _internal_verify(hashed, salt, hash_to_check);
}