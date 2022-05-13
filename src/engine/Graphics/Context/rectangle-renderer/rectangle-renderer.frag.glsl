#version 300 es

precision mediump float;

// UV coord
in vec2 v_uv;

in vec2 v_size; // in pixels

// Color coord to blend with image
in lowp vec4 v_color;

// Stroke color if used
in lowp vec4 v_strokeColor;

// Stroke thickness if used
in lowp float v_strokeThickness; // in pixels

// Opacity
in float v_opacity;

out vec4 fragColor;

void main() {
    // modified from https://stackoverflow.com/questions/59197671/glsl-rounded-rectangle-with-variable-border
    vec2 uv = v_uv;
    vec2 fragCoord = uv * v_size;
    float maxX = v_size.x - v_strokeThickness;
    float minX = v_strokeThickness;
    float maxY = v_size.y - v_strokeThickness;
    float minY = v_strokeThickness;

    if (fragCoord.x < maxX && fragCoord.x > minX &&
        fragCoord.y < maxY && fragCoord.y > minY) {
      fragColor = v_color;
    } else {
      fragColor = v_strokeColor;
    }
    fragColor.a *= v_opacity;
    fragColor.rgb *= fragColor.a;

    // vec2 v2CenteredPos     = abs(fragCoord - v_size.xy / 2.0);
    // vec2 v2HalfShapeSizePx = v_size.xy/2.0 - v_strokeThickness/2.0;

    // float fHalfBorderDist      = 0.0;
    // float fHalfBorderThickness = 0.0;

    // if (fragCoord.x > max(v_radius, v_strokeThickness) && 
    //     fragCoord.x < v_size.x - max(v_radius, v_strokeThickness))
    // {
    //     fHalfBorderDist      = v2CenteredPos.y - v2HalfShapeSizePx.y;
    //     fHalfBorderThickness = v_strokeThickness / 2.0;
    // }
    // else if (fragCoord.y > max(v_radius, v_strokeThickness) && 
    //          fragCoord.y < v_size.y - max(v_radius, v_strokeThickness))
    // {
    //     fHalfBorderDist      = v2CenteredPos.x - v2HalfShapeSizePx.x;
    //     fHalfBorderThickness = v_strokeThickness / 2.0;
    // }
    // else
    // {
    //     vec2 edgeVec = max(vec2(0.0), v_radius - vec2(
    //         uv.x > 0.5 ? v_size.x - fragCoord.x : fragCoord.x,
    //         uv.y > 0.5 ? v_size.y - fragCoord.y : fragCoord.y));
        
    //     float ellipse_ab    = v_radius-v_strokeThickness;
    //     vec2 ellipse_isect = (v_strokeThickness > v_radius || v_strokeThickness > v_radius) ? vec2(0.0) :
    //                             edgeVec.xy * ellipse_ab*ellipse_ab / length(ellipse_ab*edgeVec.yx); 
            
    //     fHalfBorderThickness = (v_radius - length(ellipse_isect)) / 2.0;
    //     fHalfBorderDist      = length(edgeVec) - (v_radius - fHalfBorderThickness);
    // }

    // vec4 v4FromColor = v_strokeColor;
    // v4FromColor.rgb *= v4FromColor.a;
    // vec4 v4ToColor   = vec4(0.0); // background color is transparent
    // if (fHalfBorderDist < 0.0) {
    //     v4ToColor = v_color;
    //     v4ToColor.rgb *= v4ToColor.a;
    // }

    // float mixPct = abs(fHalfBorderDist) - fHalfBorderThickness;

    // vec4 finalColor = mix(v4FromColor, v4ToColor, mixPct);
    // gl_FragColor = finalColor;
}