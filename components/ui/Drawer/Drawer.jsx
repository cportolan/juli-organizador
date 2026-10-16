import Modal from "@/components/ui/Modal/Modal";

/** Panel lateral derecho: misma lógica que Modal, distinta ubicación. */
export default function Drawer({ size = "md", ...props }) {
  return <Modal placement="right" size={size} {...props} />;
}
