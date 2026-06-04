
CREATE OR REPLACE FUNCTION public.review_package_purchase(_id UUID, _approve BOOLEAN, _note TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.package_purchases%ROWTYPE;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin')) THEN
    RETURN json_build_object('success', false, 'error', 'Admins only');
  END IF;
  SELECT * INTO _row FROM public.package_purchases WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Not found'); END IF;
  UPDATE public.package_purchases
    SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
        admin_note=_note, reviewed_by=auth.uid(), reviewed_at=now()
    WHERE id=_id;
  IF _approve THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_row.user_id, 'client')
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.notifications(user_id, type, title, body, data)
      VALUES (_row.user_id, 'purchase_approved', 'Package activated',
              'Your purchase has been approved.', jsonb_build_object('purchase_id', _row.id));
  ELSE
    INSERT INTO public.notifications(user_id, type, title, body, data)
      VALUES (_row.user_id, 'purchase_rejected', 'Purchase rejected',
              COALESCE(_note,'Your purchase was rejected.'), jsonb_build_object('purchase_id', _row.id));
  END IF;
  RETURN json_build_object('success', true);
END $$;
