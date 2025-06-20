import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { assetExportService } from "@/lib/services/assetExport";
import type { Database } from "@/lib/types/supabase";

// Validation schemas
const exportAssetSchema = z.object({
  designFileId: z.string().uuid(),
  imageUrl: z.string().url(),
  name: z.string().min(1),
  format: z.enum(["png", "jpg", "webp", "svg"]),
  scale: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .optional()
    .default(1),
  quality: z.number().min(0.1).max(1).optional(),
  cropArea: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  maxSizeKB: z.number().positive().optional(),
});

const batchExportSchema = z.object({
  designFileId: z.string().uuid(),
  imageUrl: z.string().url(),
  baseName: z.string().min(1),
  formats: z.array(z.enum(["png", "jpg", "webp", "svg"])).min(1),
  scales: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).min(1),
  quality: z.number().min(0.1).max(1).optional(),
  cropArea: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "single";

    if (mode === "batch") {
      // Batch export
      const validatedData = batchExportSchema.parse(body);

      // Verify user has access to the design file
      const { data: designFile, error: designFileError } = await supabase
        .from("design_files")
        .select(
          `
          id,
          project_id,
          projects!inner (
            id,
            created_by,
            project_members!inner (
              user_id
            )
          )
        `
        )
        .eq("id", validatedData.designFileId)
        .single();

      if (designFileError || !designFile) {
        return NextResponse.json(
          { error: "Design file not found" },
          { status: 404 }
        );
      }

      // Check permissions
      const hasAccess =
        designFile.projects.created_by === session.user.id ||
        designFile.projects.project_members.some(
          (member) => member.user_id === session.user.id
        );

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Perform batch export
      const result = await assetExportService.batchExport({
        designFileId: validatedData.designFileId,
        imageUrl: validatedData.imageUrl,
        baseName: validatedData.baseName,
        formats: validatedData.formats,
        scales: validatedData.scales,
        quality: validatedData.quality,
        cropArea: validatedData.cropArea,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      // Single export
      const validatedData = exportAssetSchema.parse(body);

      // Verify user has access to the design file
      const { data: designFile, error: designFileError } = await supabase
        .from("design_files")
        .select(
          `
          id,
          project_id,
          projects!inner (
            id,
            created_by,
            project_members!inner (
              user_id
            )
          )
        `
        )
        .eq("id", validatedData.designFileId)
        .single();

      if (designFileError || !designFile) {
        return NextResponse.json(
          { error: "Design file not found" },
          { status: 404 }
        );
      }

      // Check permissions
      const hasAccess =
        designFile.projects.created_by === session.user.id ||
        designFile.projects.project_members.some(
          (member) => member.user_id === session.user.id
        );

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Perform single export
      const result = await assetExportService.exportAsset({
        designFileId: validatedData.designFileId,
        imageUrl: validatedData.imageUrl,
        name: validatedData.name,
        format: validatedData.format,
        scale: validatedData.scale,
        quality: validatedData.quality,
        cropArea: validatedData.cropArea,
        maxSizeKB: validatedData.maxSizeKB,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error("Asset export error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Asset export failed",
      },
      { status: 500 }
    );
  }
}

// Get exported assets for a design file
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const designFileId = searchParams.get("designFileId");
    const projectId = searchParams.get("projectId");

    if (!designFileId && !projectId) {
      return NextResponse.json(
        { error: "designFileId or projectId is required" },
        { status: 400 }
      );
    }

    if (designFileId) {
      // Get assets for specific design file
      const assets = await assetExportService.getExportedAssets(designFileId);

      return NextResponse.json({
        success: true,
        data: assets,
      });
    } else if (projectId) {
      // Get assets for entire project
      const assets = await assetExportService.getProjectAssets(projectId);

      return NextResponse.json({
        success: true,
        data: assets,
      });
    }
  } catch (error) {
    console.error("Get assets error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch assets",
      },
      { status: 500 }
    );
  }
}

// Delete an exported asset
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    // Verify user owns the asset or has project access
    const { data: asset, error: assetError } = await supabase
      .from("exported_assets")
      .select(
        `
        id,
        created_by,
        project_id,
        projects!inner (
          id,
          created_by,
          project_members!inner (
            user_id
          )
        )
      `
      )
      .eq("id", assetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Check permissions (user owns asset or is project owner)
    const canDelete =
      asset.created_by === session.user.id ||
      asset.projects.created_by === session.user.id;

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the asset
    await assetExportService.deleteExportedAsset(assetId);

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Delete asset error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete asset",
      },
      { status: 500 }
    );
  }
}
