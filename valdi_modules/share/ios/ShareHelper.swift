import UIKit

/// Native iOS implementation for the polyglot Share module.
/// Presents UIActivityViewController for the system share sheet.
/// The host app should wire Device.share(options) to ShareHelper.share(...).
@objc(SCValdiShareHelper)
public final class ShareHelper: NSObject {

    /// Show the system share sheet with the given content.
    /// Call from the native bridge when Share.share(options) is invoked from TS.
    @objc public static func share(title: String?, text: String?, url: String?) {
        var items: [Any] = []
        if let t = text, !t.isEmpty { items.append(t) }
        if let u = url, !u.isEmpty, let parsed = URL(string: u) { items.append(parsed) }
        if items.isEmpty { return }
        DispatchQueue.main.async {
            guard let windowScene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }),
                  let root = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController
            else { return }
            var top = root
            while let presented = top.presentedViewController { top = presented }
            let activity = UIActivityViewController(activityItems: items, applicationActivities: nil)
            if let popover = activity.popoverPresentationController {
                popover.sourceView = top.view
                popover.sourceRect = CGRect(x: top.view.bounds.midX, y: top.view.bounds.midY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            top.present(activity, animated: true)
        }
    }
}
