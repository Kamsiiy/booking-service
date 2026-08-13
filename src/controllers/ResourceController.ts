import type { BunRequest } from "bun";
import HttpResponse from "../common/HttpResponse";
import { ResourceService } from "../services/ResourceService";
import type { CreateResourceForm } from "../forms/resource";
import type { SetAvailabilityForm } from "../forms/resource";
 import { requireAuth } from "../middleware/auth";

export class ResourceController {
  private resourceService = new ResourceService();

  // Baseline read endpoints are wired up so the routing pattern is clear.
  // Feature owner: add create/update/delete, availability windows, and block/unblock.

  async list(): Promise<Response> {
    const resources = await this.resourceService.findAll();
    return HttpResponse.success("Resources fetched successfully", resources);
  }

  async getById(req: BunRequest<"/resources/:id">): Promise<Response> {
    const id = Number(req.params.id);
    const resource = await this.resourceService.findById(id);

    if (!resource) return HttpResponse.notFound("Resource not found");
    return HttpResponse.success("Resource fetched successfully", resource);
  }
   async create(req: Request): Promise<Response> {
    const auth = await requireAuth(req); if (auth instanceof Response) return auth;
    const body = (await req.json()) as CreateResourceForm;

    if (!body.name || !body.type) {
      return HttpResponse.failure("Name and type are required", 400);
    }
    if (typeof body.capacity !== "number" || body.capacity <= 0) {
      return HttpResponse.failure("Capacity must be a positive number", 400);
    }

    const resource = await this.resourceService.createResource(body);
    return HttpResponse.success("Resource created successfully", resource, 201);
  }

  async update(req: BunRequest<"/resources/:id">): Promise<Response> {
    const auth = await requireAuth(req); if (auth instanceof Response) return auth;
    const id = Number(req.params.id);
    const body = (await req.json()) as Partial<CreateResourceForm>;

    const existing = await this.resourceService.findById(id);
    if (!existing) return HttpResponse.notFound("Resource not found");

    if (body.capacity !== undefined && (typeof body.capacity !== "number" || body.capacity <= 0)) {
      return HttpResponse.failure("Capacity must be a positive number", 400);
    }

    const updated = await this.resourceService.updateById(id, body);
    return HttpResponse.success("Resource updated successfully", updated);
  }

  async delete(req: BunRequest<"/resources/:id">): Promise<Response> {
    const auth = await requireAuth(req); if (auth instanceof Response) return auth;
    const id = Number(req.params.id);

    const existing = await this.resourceService.findById(id);
    if (!existing) return HttpResponse.notFound("Resource not found");

    await this.resourceService.deleteById(id);
    return HttpResponse.success("Resource deleted successfully");
  }

  async block(req: BunRequest<"/resources/:id/block">): Promise<Response> {
      const auth = await requireAuth(req);
      if (auth instanceof Response) return auth;
    const id = Number(req.params.id);

    const existing = await this.resourceService.findById(id);
    if (!existing) return HttpResponse.notFound("Resource not found");

    const updated = await this.resourceService.blockResource(id);
    return HttpResponse.success("Resource blocked successfully", updated);
  }

  async unblock(req: BunRequest<"/resources/:id/unblock">): Promise<Response> {
     const auth = await requireAuth(req); 
     if (auth instanceof Response) return auth;
    const id = Number(req.params.id);

    const existing = await this.resourceService.findById(id);
    if (!existing) return HttpResponse.notFound("Resource not found");

    const updated = await this.resourceService.unblockResource(id);
    return HttpResponse.success("Resource unblocked successfully", updated);
  }

  async setAvailability(req: BunRequest<"/resources/:id/availability">): Promise<Response> {
    const auth = await requireAuth(req); if (auth instanceof Response) return auth;
    const id = Number(req.params.id);
    const body = (await req.json()) as SetAvailabilityForm;

    const existing = await this.resourceService.findById(id);
    if (!existing) return HttpResponse.notFound("Resource not found");

    if (!body.open_time || !body.close_time) {
      return HttpResponse.failure("open_time and close_time are required", 400);
    }

    const updated = await this.resourceService.setAvailability(id, body);
    return HttpResponse.success("Availability updated successfully", updated);
  }

}
