
                                    $("#revue-presse-spectateurs-modal-lg").on('hidden.bs.modal', function(e) {
                                var $this = $(this);
                                var $frame = $this.find('iframe');
                                $frame.attr("src", $frame.attr("src"));
                                });
                                