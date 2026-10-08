import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Input ported from mobile/components/ui/Input.tsx onto DESIGN.md §6.3:
/// bordered on paper, 40px, label above at 14/500, helper/error below at 13px.
/// Error state without color: ink border + warning icon + ink message.
class PkTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final String? label;
  final String? placeholder;
  final String? helper;
  final String? error;
  final bool obscureText;
  final TextInputType keyboardType;
  final Widget? prefixIcon;
  final bool enabled;
  final bool readOnly;
  final int? maxLines;
  final int? minLines;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onSubmitted;
  final FocusNode? focusNode;

  const PkTextField({
    super.key,
    this.controller,
    this.initialValue,
    this.onChanged,
    this.label,
    this.placeholder,
    this.helper,
    this.error,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.minLines,
    this.onEditingComplete,
    this.onSubmitted,
    this.focusNode,
  });

  @override
  State<PkTextField> createState() => _PkTextFieldState();
}

class _PkTextFieldState extends State<PkTextField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: type.label),
          const SizedBox(height: PkSpace.s8),
        ],
        ConstrainedBox(
          constraints: const BoxConstraints(minHeight: PkSpace.controlMd),
          child: TextField(
            controller: widget.controller,
            focusNode: widget.focusNode,
            onChanged: widget.onChanged,
            onEditingComplete: widget.onEditingComplete,
            onSubmitted: widget.onSubmitted,
            obscureText: widget.obscureText && _obscured,
            keyboardType: widget.keyboardType,
            enabled: widget.enabled,
            readOnly: widget.readOnly,
            maxLines: widget.maxLines,
            minLines: widget.minLines,
            autocorrect: false,
            style: type.bodySm,
            decoration: InputDecoration(
              hintText: widget.placeholder,
              helperText: widget.error == null ? widget.helper : null,
              error: widget.error == null
                  ? null
                  : Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.warning_outlined,
                          size: 16,
                          color: t.danger.main,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            widget.error!,
                            style: type.meta.copyWith(
                              color: t.danger.main,
                            ),
                          ),
                        ),
                      ],
                    ),
              prefixIcon: widget.prefixIcon,
              prefixIconConstraints: const BoxConstraints(
                minWidth: 44,
                minHeight: PkSpace.controlMd,
              ),
              suffixIcon: widget.obscureText
                  ? IconButton(
                      onPressed: () =>
                          setState(() => _obscured = !_obscured),
                      icon: Icon(
                        _obscured
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                        color: t.muted,
                      ),
                    )
                  : null,
            ),
          ),
        ),
      ],
    );
  }
}
