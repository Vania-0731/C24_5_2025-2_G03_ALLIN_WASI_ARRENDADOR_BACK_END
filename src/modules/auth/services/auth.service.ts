import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { DomainValidationService, UserType } from './domain-validation.service';
import { User } from '../../users/entities/user.entity';
import { TenantsService } from '../../tenants/services/tenants.service';
import { LandlordsService } from '../../landlords/services/landlords.service';
import { RolesService } from '../../roles/services/roles.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly domainValidationService: DomainValidationService,
    private readonly tenantsService: TenantsService,
    private readonly landlordsService: LandlordsService,
    private readonly rolesService: RolesService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, emails, name, photos } = profile;
    
    const email = emails[0].value;
    const fullName = `${name.givenName} ${name.familyName}`;
    const profilePicture = photos[0]?.value;
    const desiredRoleName = this.domainValidationService.inferRole(email);
    try {
      this.domainValidationService.validateEmailDomain(
        email,
        desiredRoleName === 'tenant' ? UserType.TENANT : UserType.LANDLORD,
      );
    } catch (_) {}

    // Obtener roleId del rol inferido
    const role = await this.rolesService.findByName(desiredRoleName);
    if (!role) {
      throw new Error(`Rol '${desiredRoleName}' no encontrado en la base de datos`);
    }

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      try {
        user = await this.usersService.create({
          fullName,
          email,
          profilePicture,
          googleId: id,
          isVerified: true, // Los usuarios de Google están verificados por defecto
          roleId: role.id,
        });
      } catch (e) {
        if (e instanceof ConflictException) {
          const existing = await this.usersService.findByEmail(email);
          if (existing && !existing.googleId) {
            user = await this.usersService.update(existing.id, {
              googleId: id,
              profilePicture,
              isVerified: true,
              roleId: role.id,
            });
          } else if (existing) {
            // Siempre actualizar la foto de Google aunque el usuario ya exista
            user = await this.usersService.update(existing.id, {
              profilePicture,
            });
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    } else {
      const updates: any = {};
      if (!user.googleId) updates.googleId = id;
      if (profilePicture && user.profilePicture !== profilePicture) updates.profilePicture = profilePicture;
      if (!user.isVerified) updates.isVerified = true;
      // Cargar user con role para comparar
      const userWithRole = await this.usersService.findById(user.id);
      if (userWithRole.role?.name !== desiredRoleName) {
        updates.roleId = role.id;
      }
      if (Object.keys(updates).length > 0) {
        user = await this.usersService.update(user.id, updates);
      }
    }

    try {
      const userWithRole = await this.usersService.findById(user.id);
      if (userWithRole.role?.name === 'tenant') {
        await this.tenantsService.ensureExistsForUser(user.id);
      } else if (userWithRole.role?.name === 'landlord') {
        await this.landlordsService.ensureExistsForUser(user.id);
      }
    } catch (_) {}

    return user;
  }

  async generateJwtToken(user: User): Promise<{ access_token: string; user: User }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  async syncGoogleUserFromNextAuth(payload: {
    email?: string;
    name?: string;
    image?: string;
    provider?: string;
    providerAccountId?: string;
    profile?: any;
    role?: string;
  }): Promise<{ user: User; created: boolean; updated: boolean }> {
    const email = payload.email?.trim();
    const fullName = payload.name ?? '';
    const profilePicture = payload.image;
    const googleId = payload.providerAccountId;
    const incomingRole = (payload.role as string | undefined)?.toLowerCase();

    if (!email) {
      throw new Error('Email is required');
    }

    let desiredRoleName: string;
    if (incomingRole === 'tenant') {
      desiredRoleName = 'tenant';
    } else if (incomingRole === 'landlord') {
      desiredRoleName = 'landlord';
    } else {
      desiredRoleName = this.domainValidationService.inferRole(email);
    }
    const role = await this.rolesService.findByName(desiredRoleName);
    if (!role) {
      throw new Error(`Rol '${desiredRoleName}' no encontrado en la base de datos`);
    }

    let user = await this.usersService.findByEmail(email);
    let created = false;
    let updated = false;

    if (!user) {
      try {
        user = await this.usersService.create({
          fullName: fullName || email,
          email,
          profilePicture,
          googleId,
          isVerified: true,
          roleId: role.id,
        });
        created = true;
      } catch (e) {
        if (e instanceof ConflictException) {
          user = await this.usersService.findByEmail(email) as User;
        } else {
          throw e;
        }
      }
    } else {
      const updates: any = {};
      if (!user.googleId && googleId) updates.googleId = googleId;
      if (profilePicture && user.profilePicture !== profilePicture) updates.profilePicture = profilePicture;
      if (!user.isVerified) updates.isVerified = true;
      const userWithRole = await this.usersService.findById(user.id);
      if (userWithRole.role?.name !== desiredRoleName) {
        updates.roleId = role.id;
      }

      if (Object.keys(updates).length > 0) {
        user = await this.usersService.update(user.id, updates);
        updated = true;
      }
    }
    return { user, created, updated };
  }

  async register(payload: { email: string; fullName?: string; password?: string; role?: string }): Promise<{ user: User; access_token: string; registrationComplete: boolean }> {
    const email = payload.email.trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const desiredRoleName = payload.role?.toLowerCase() === 'landlord' ? 'landlord' : (payload.role?.toLowerCase() === 'tenant' ? 'tenant' : this.domainValidationService.inferRole(email));
    const role = await this.rolesService.findByName(desiredRoleName);
    if (!role) {
      throw new Error(`Rol '${desiredRoleName}' no encontrado`);
    }

    let hashedPassword = undefined;
    if (payload.password) {
      hashedPassword = await bcrypt.hash(payload.password, 10);
    }

    const user = await this.usersService.create({
      fullName: payload.fullName || email.split('@')[0],
      email,
      password: hashedPassword,
      isVerified: false,
      roleId: role.id,
    });

    // Auto-create initial blank tenant or landlord profiles
    if (desiredRoleName === 'tenant') {
      await this.tenantsService.ensureExistsForUser(user.id).catch(() => null);
    } else {
      await this.landlordsService.ensureExistsForUser(user.id).catch(() => null);
    }

    const { access_token } = await this.generateJwtToken(user);
    return { user, access_token, registrationComplete: false };
  }

  async login(payload: { email: string; password?: string }): Promise<{ user: User; access_token: string; registrationComplete: boolean }> {
    const email = payload.email.trim();
    // Utilizar query builder para poder traer la contraseña oculta ('select: false')
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userWithPassword = await this.usersService.findById(user.id);
    const dbUserRaw = await this.usersService['userRepository']
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id: user.id })
      .getOne();

    if (!dbUserRaw || !dbUserRaw.password) {
      throw new UnauthorizedException('Este usuario no tiene contraseña registrada (inicia sesión con Google)');
    }

    const isMatch = await bcrypt.compare(payload.password || '', dbUserRaw.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const roleName = userWithPassword.role?.name;
    let registrationComplete = false;
    if (roleName === 'landlord') {
      const landlord = await this.landlordsService.findByUserId(user.id).catch(() => null);
      // Profile is complete only if required fields are filled (not blank shell)
      registrationComplete = !!landlord && !!landlord.phone && landlord.phone.length > 0 && !!landlord.dni && landlord.dni.length > 0;
    } else if (roleName === 'tenant') {
      const tenant = await this.tenantsService.findByUserId(user.id).catch(() => null);
      // Profile is complete only if required fields are filled (not blank shell)
      registrationComplete = !!tenant && !!tenant.phone && tenant.phone.length > 0 && !!tenant.code && tenant.code.length > 0;
    } else {
      registrationComplete = true;
    }

    const { access_token } = await this.generateJwtToken(user);
    return { user: userWithPassword, access_token, registrationComplete };
  }

  async completeRegistration(userId: string, registrationData: any): Promise<User> {
    return await this.usersService.update(userId, registrationData);
  }
}
