import { Repository } from "typeorm";
import { RiderLocation } from "../entities/riderLocation.entity";
import { AppDataSource } from "../data-source";
import { UUID } from "../types";
import { NotFoundError } from "../helpers/errors.helper";

export class RiderLocationService {
  private readonly riderLocationRepository: Repository<RiderLocation>;

  constructor() {
    this.riderLocationRepository = AppDataSource.getRepository(RiderLocation);
  }

  // UPDATE OR CREATE RIDER LOCATION
  async updateRiderLocation(
    riderId: UUID,
    latitude: number,
    longitude: number,
    isOnline: boolean = true
  ): Promise<RiderLocation> {
    let riderLocation = await this.riderLocationRepository.findOne({
      where: { riderId },
    });

    if (riderLocation) {
      riderLocation.latitude = latitude;
      riderLocation.longitude = longitude;
      riderLocation.isOnline = isOnline;
      riderLocation.lastUpdated = new Date();
    } else {
      riderLocation = this.riderLocationRepository.create({
        riderId,
        latitude,
        longitude,
        isOnline,
        lastUpdated: new Date(),
      });
    }

    return this.riderLocationRepository.save(riderLocation);
  }

  // GET RIDER LOCATION
  async getRiderLocation(riderId: UUID): Promise<RiderLocation | null> {
    return this.riderLocationRepository.findOne({
      where: { riderId },
      relations: { rider: true },
    });
  }

  // GET ALL ONLINE RIDER LOCATIONS
  async getOnlineRiderLocations(): Promise<RiderLocation[]> {
    return this.riderLocationRepository.find({
      where: { isOnline: true },
      relations: { rider: { userRoles: { role: true } } },
    });
  }

  // SET RIDER OFFLINE
  async setRiderOffline(riderId: UUID): Promise<RiderLocation> {
    const riderLocation = await this.riderLocationRepository.findOne({
      where: { riderId },
    });

    if (!riderLocation) {
      throw new NotFoundError("Rider location not found");
    }

    riderLocation.isOnline = false;
    riderLocation.lastUpdated = new Date();

    return this.riderLocationRepository.save(riderLocation);
  }
}
