"""
Name: 'pumpkin spice 3d object format'
Blender: 361
Group: 'Export'
Tooltip: 'pumpkin spice object exporter'
"""

import bpy

# ExportHelper is a helper class, defines filename and
# invoke() function which calls the file selector.
from bpy_extras.io_utils import ExportHelper
from bpy.props import StringProperty, BoolProperty, EnumProperty
from bpy.types import Operator

def writeBoneMatrix(out, key):
    for vector in bpy.data.objects['Armature'].pose.bones[key].matrix:
        for value in vector:
            out.write('%s ' % value)
    out.write('\n')

def write_some_data(context, filepath, use_some_setting):
    out = open(filepath, 'w', encoding='utf-8')
    object = bpy.context.view_layer.objects.active

    objGroupNames = [g.name for g in object.vertex_groups]
    
    bpy.ops.object.mode_set(mode = 'EDIT')
    bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
    bpy.ops.object.mode_set(mode = 'OBJECT')
    
    mesh = object.to_mesh()
    writeVertices(out, mesh)
    
    writeFacesAndNormals(out, mesh)
    
    writeTextureCoordinates(out, object, mesh)
            
            
    return {'FINISHED'}

def writeTextureCoordinates(out, object, mesh):
    out.write('textureCoordinates: \n')
    
    for face in mesh.polygons:
        for vert_idx, loop_idx in zip(face.vertices, face.loop_indices):
            uv_coords = object.data.uv_layers.active.data[loop_idx].uv
            print(face.index, vert_idx)
            print(object.data.uv_layers.active.data);
            out.write( '%i %i %f %f\n' % (face.index, vert_idx, uv_coords.x, uv_coords.y) )

def writeFacesAndNormals(out, mesh):
    out.write('faces: \n')
    normals = []
    for face in mesh.polygons:
        normals.append(face.normal)
        for vert in face.vertices:
            out.write( '%i ' % (int(vert)) )
        out.write('\n')
    
    out.write('normals: \n')
    for normal in normals:
        out.write( '%f %f %f\n' % (normal.x, normal.y, normal.z) )

def writeVertices(out, mesh):
    out.write('vertices: \n')
    for vert in mesh.vertices:
        out.write( '%f %f %f\n' % (vert.co.x, vert.co.y, vert.co.z) )


class ExportSomeData(Operator, ExportHelper):
    bl_idname = "export_test.some_data"  # important since its how bpy.ops.import_test.some_data is constructed
    bl_label = "Export Some Data"

    # ExportHelper mixin class uses this
    filename_ext = ".ps"

    filter_glob: StringProperty(
        default="*.ps",
        options={'HIDDEN'},
        maxlen=255,  # Max internal buffer length, longer would be clamped.
    )

    # List of operator properties, the attributes will be assigned
    # to the class instance from the operator settings before calling.
    use_setting: BoolProperty(
        name="Example Boolean",
        description="Example Tooltip",
        default=True,
    )

    type: EnumProperty(
        name="Example Enum",
        description="Choose between two items",
        items=(
            ('OPT_A', "First Option", "Description one"),
            ('OPT_B', "Second Option", "Description two"),
        ),
        default='OPT_A',
    )

    def execute(self, context):
        return write_some_data(context, self.filepath, self.use_setting)


# Only needed if you want to add into a dynamic menu
def menu_func_export(self, context):
    self.layout.operator(ExportSomeData.bl_idname, text="Text Export Operator")


# Register and add to the "file selector" menu (required to use F3 search "Text Export Operator" for quick access).
def register():
    bpy.utils.register_class(ExportSomeData)
    bpy.types.TOPBAR_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(ExportSomeData)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func_export)


if __name__ == "__main__":
    register()

    # test call
    bpy.ops.export_test.some_data('INVOKE_DEFAULT')
