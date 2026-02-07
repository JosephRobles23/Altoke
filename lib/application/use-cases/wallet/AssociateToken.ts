/**
 * AssociateToken use case - NO APLICA EN EVM/BASE
 *
 * En EVM (Base), no es necesario asociar tokens explícitamente.
 * Los tokens ERC-20 como USDC se pueden recibir en cualquier dirección
 * sin necesidad de un paso previo de asociación.
 *
 * Este archivo se mantiene como documentación del cambio de arquitectura.
 *
 * @deprecated No es necesario en arquitectura Base/EVM
 */
export class AssociateTokenUseCase {
  async execute(): Promise<void> {
    throw new Error(
      'AssociateToken no es necesario en EVM/Base. ' +
        'Los tokens ERC-20 se pueden recibir sin asociación previa.'
    );
  }
}
