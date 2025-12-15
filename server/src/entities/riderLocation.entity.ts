import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "./index";
import { UUID } from "../types";
import { User } from "./user.entity";

@Entity("rider_locations")
export class RiderLocation extends AbstractEntity {
  // RIDER ID
  @Column({ name: "rider_id", type: "uuid", nullable: false, unique: true })
  riderId: UUID;

  // LATITUDE
  @Column({ name: "latitude", type: "decimal", precision: 10, scale: 7, nullable: false })
  latitude: number;

  // LONGITUDE
  @Column({ name: "longitude", type: "decimal", precision: 10, scale: 7, nullable: false })
  longitude: number;

  // IS ONLINE
  @Column({ name: "is_online", type: "boolean", nullable: false, default: false })
  isOnline: boolean;

  // LAST UPDATED
  @Column({ name: "last_updated", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  lastUpdated: Date;

  /**
   * RELATIONS
   */

  // RIDER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "rider_id" })
  rider: User;
}
